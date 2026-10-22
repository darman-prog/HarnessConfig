# Trazabilidad portable: cola (BACKLOG.md), expediente (NNN-*.md) y registro (INDEX.md).
# Python 3.8+, solo stdlib. Escribe UTF-8 sin BOM y LF; nunca regenera archivos existentes.
import argparse
import datetime
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

SCHEMA = "1"
DEFAULT_AREAS = "ui,backend,infra,product,docs,harness"
STATES_OPEN = ("pendiente", "en-curso", "bloqueada")
STATES_SPEC = ("borrador", "aprobada", "en-curso", "bloqueada", "cerrada")
SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
ID_RE = re.compile(r"^\|?\s*B-(\d{3,})\s*\|", re.MULTILINE)
RECORD_RE = re.compile(r"^(\d{3})-(.+)\.md$")


def fail(msg):
    print("ERROR: " + msg)
    sys.exit(1)


def warn(msg):
    print("WARN: " + msg)


def today():
    return datetime.date.today().isoformat()


def features_dir(repo, subdir):
    return Path(repo).resolve() / subdir


def read(path):
    # newline="" conserva los saltos tal cual; el archivo se escribe siempre en LF.
    with open(str(path), "r", encoding="utf-8", newline="") as fh:
        return fh.read()


def write_atomic(path, text):
    # Temporal + replace: si el proceso muere a medias, el original queda intacto.
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=".trace-", suffix=".tmp")
    os.close(fd)
    try:
        with open(tmp, "w", encoding="utf-8", newline="") as fh:
            fh.write(text)
        os.replace(tmp, str(path))
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def frontmatter(text):
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    meta = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta


def set_frontmatter(text, key, value):
    # Reemplaza solo esa clave; no reescribe el resto del frontmatter.
    pattern = re.compile(r"(?m)^" + re.escape(key) + r":.*$")
    if pattern.search(text):
        return pattern.sub(key + ": " + value, text, count=1)
    end = text.find("\n---", 3)
    if end == -1:
        fail("frontmatter sin cierre")
    return text[:end] + "\n" + key + ": " + value + text[end:]


def split_row(line):
    # Respeta los pipes escapados (\|) para que un comando shell no rompa la tabla.
    raw = line.strip().strip("|")
    return [cell.strip().replace("\\|", "|") for cell in re.split(r"(?<!\\)\|", raw)]


def escape_cell(value):
    return str(value).replace("|", "\\|")


def table_rows(lines, header_prefix, offset=0):
    for i in range(offset, len(lines)):
        if lines[i].strip().startswith(header_prefix):
            start = i + 2  # header + separador
            end = start
            while end < len(lines) and lines[end].startswith("|"):
                end += 1
            return start, end
    return None, None


def table_after_heading(lines, heading, header_prefix):
    for i, line in enumerate(lines):
        if line.strip() == heading:
            return table_rows(lines, header_prefix, i)
    return None, None


def next_task_id(text):
    ids = [int(m.group(1)) for m in ID_RE.finditer(text)]
    return "B-%03d" % (max(ids) + 1 if ids else 1)


def backlog_path(fdir):
    return fdir / "BACKLOG.md"


def require_backlog(fdir):
    path = backlog_path(fdir)
    if not path.exists():
        fail("no existe %s; ejecuta trace.py init" % path)
    return path


def load_backlog(fdir):
    path = require_backlog(fdir)
    text = read(path)
    meta = frontmatter(text)
    if meta.get("trace") != SCHEMA:
        fail("version de esquema desconocida en BACKLOG.md: %r" % meta.get("trace"))
    areas = [a.strip() for a in meta.get("areas", "").strip("[]").split(",") if a.strip()]
    return path, text, meta, areas


def _find_task(lines, tid):
    start, end = table_rows(lines, "| id | área |")
    if start is None:
        fail("no se encontro la tabla abierta del backlog")
    for i in range(start, end):
        cells = split_row(lines[i])
        if cells and cells[0] == tid:
            return i, cells
    return None, None


def cmd_init(args):
    fdir = features_dir(args.repo, args.dir)
    fdir.mkdir(parents=True, exist_ok=True)
    bpath = backlog_path(fdir)
    if bpath.exists():
        print("BACKLOG.md ya existe; no se sobrescribe")
        return
    areas = [a.strip() for a in args.areas.split(",") if a.strip()]
    body = (
        "---\n"
        "trace: " + SCHEMA + "\n"
        "areas: [" + ", ".join(areas) + "]\n"
        'legacy_through: ""\n'
        "---\n\n"
        "# Backlog\n\n"
        "Trabajo abierto. Al cerrar, la fila se borra y el detalle queda en su registro.\n\n"
        "| id | área | tarea | estado | registro |\n"
        "|---|---|---|---|---|\n\n"
        "## Descartadas\n\n"
        "| id | área | tarea | motivo |\n"
        "|---|---|---|---|\n"
    )
    write_atomic(bpath, body)
    ipath = fdir / "INDEX.md"
    if not ipath.exists():
        write_atomic(ipath, (
            "---\nstatus: vigente\nlast_reviewed: " + today() + "\n---\n\n"
            "# Registro de features\n\n"
            "## Activas\n\n"
            "| Fecha | Cambio | Estado | Área | Alcance | Registro | Evidencia |\n"
            "|---|---|---|---|---|---|---|\n\n"
            "## Cerradas\n\n"
            "| Fecha | Cambio | Estado | Área | Alcance | Registro | Evidencia |\n"
            "|---|---|---|---|---|---|---|\n"
        ))
    print("creado " + str(bpath))


def cmd_task(args):
    fdir = features_dir(args.repo, args.dir)
    path, text, meta, areas = load_backlog(fdir)
    area = args.area.strip()
    if area not in areas:
        fail("area %r no declarada; validas: %s" % (area, ", ".join(areas)))
    if "|" in args.title or "\n" in args.title:
        fail("el titulo no puede contener '|' ni saltos de linea")
    tid = next_task_id(text)
    lines = text.splitlines()
    start, end = table_rows(lines, "| id | área |")
    if start is None:
        fail("no se encontro la tabla abierta del backlog")
    lines.insert(end, "| " + tid + " | " + area + " | " + args.title.strip() + " | pendiente | - |")
    write_atomic(path, "\n".join(lines) + "\n")
    print(tid)


def find_record(fdir, rid):
    rid = rid.zfill(3) if rid.isdigit() else rid
    matches = sorted(fdir.glob(rid + "-*.md"))
    if not matches:
        fail("no existe el registro " + rid)
    return matches[0]


def next_record_id(fdir):
    ids = [int(m.group(1)) for m in (RECORD_RE.match(p.name) for p in fdir.glob("*.md")) if m]
    return "%03d" % (max(ids) + 1 if ids else 1)


def template_path(name):
    # La plantilla vive en la skill, no en el proyecto: misma fuente para todos.
    return Path(__file__).resolve().parent.parent / "references" / "templates" / name


def cmd_start(args):
    fdir = features_dir(args.repo, args.dir)
    path_backlog, text_backlog, meta, areas = load_backlog(fdir)
    if not SLUG_RE.match(args.slug):
        fail("slug invalido: usa minusculas y guiones")
    if any(p.name.endswith("-" + args.slug + ".md") for p in fdir.glob("*.md")):
        fail("ya existe un registro con el slug " + args.slug)
    area = args.area
    if args.tarea:
        index, cells = _find_task(text_backlog.splitlines(), args.tarea)
        if index is None:
            fail("no existe la tarea " + args.tarea + " en el backlog")
        if not area:
            area = cells[1]
    area = area or "sin-clasificar"
    rid = next_record_id(fdir)
    status = args.status or ("en-curso" if args.tarea else "borrador")
    if status not in STATES_SPEC:
        fail("estado invalido: " + status)
    path = fdir / (rid + "-" + args.slug + ".md")
    if args.dry_run:
        print("crearia %s (area=%s, tarea=%s, status=%s)" % (path, area, args.tarea or "-", status))
        return
    tpl = template_path("SPEC.md")
    if not tpl.exists():
        fail("falta la plantilla " + str(tpl))
    text = read(tpl)
    for key, value in {
        "{{ID}}": rid,
        "{{TITLE}}": args.title,
        "{{SUMMARY}}": args.summary or args.title,
        "{{AREA}}": area,
        "{{TASK}}": args.tarea or "-",
        "{{DATE}}": today(),
        "{{STATUS}}": status,
    }.items():
        text = text.replace(key, value)
    if "{{" in text:
        fail("quedaron placeholders sin rellenar en la plantilla")
    write_atomic(path, text)
    try:
        _add_index_row(fdir, args.title, status, area, path.name)
        if args.tarea:
            _set_backlog_state(fdir, args.tarea, "en-curso", rid)
    except SystemExit:
        path.unlink(missing_ok=True)
        raise
    print(str(path))


def _add_index_row(fdir, title, status, area, filename):
    ipath = fdir / "INDEX.md"
    if not ipath.exists():
        return
    lines = read(ipath).splitlines()
    start, end = table_after_heading(lines, "## Activas", "| Fecha | Cambio |")
    if start is None:
        fail("INDEX.md sin tabla en '## Activas'")
    cols = len(split_row(lines[start - 2]))
    link = "[" + filename + "](" + filename + ")"
    if cols >= 7:
        row = "| %s | %s | %s | %s | Pendiente de detallar | %s | - |" % (today(), title, status, area, link)
    else:
        row = "| %s | %s | %s | Pendiente de detallar | %s | - |" % (today(), title, status, link)
    lines.insert(end, row)
    write_atomic(ipath, "\n".join(lines) + "\n")


def _set_backlog_state(fdir, tid, state, rid):
    path, text, meta, areas = load_backlog(fdir)
    lines = text.splitlines()
    index, cells = _find_task(lines, tid)
    if index is None:
        fail("no existe la tarea " + tid + " en el backlog")
    cells[3] = state
    cells[4] = rid
    lines[index] = "| " + " | ".join(cells) + " |"
    write_atomic(path, "\n".join(lines) + "\n")


def _criteria(spec_text):
    lines = spec_text.splitlines()
    start, end = table_after_heading(lines, "## Criterios de aceptación", "| N.º | Criterio")
    if start is None:
        return []
    rows = []
    for line in lines[start:end]:
        cells = split_row(line)
        if len(cells) >= 4 and cells[0].isdigit():
            rows.append({"n": cells[0], "criterio": cells[1],
                         "comando": cells[2].strip("` "), "evidencia": cells[3]})
    return rows


def _bitacora(spec_text):
    lines = spec_text.splitlines()
    start, end = table_after_heading(lines, "## Bitácora", "| Criterio | Fecha")
    if start is None:
        return []
    return [split_row(line) for line in lines[start:end]]


def _git_sha(repo):
    try:
        out = subprocess.run(["git", "-C", str(repo), "rev-parse", "--short", "HEAD"],
                             capture_output=True, text=True, timeout=20)
        if out.returncode == 0 and out.stdout.strip():
            return out.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        pass
    return "sin-git"


def cmd_record(args):
    fdir = features_dir(args.repo, args.dir)
    spec = find_record(fdir, args.registro)
    text = read(spec)
    target = [c for c in _criteria(text) if c["n"] == str(args.criterio)]
    if not target:
        fail("el criterio %s no existe en %s" % (args.criterio, spec.name))
    command = target[0]["comando"].strip()
    if not command:
        fail("el criterio %s no tiene comando; anadelo en la spec" % args.criterio)
    print("comando del criterio %s: %s" % (args.criterio, command))
    if not args.yes:
        fail("requiere --yes: el comando debe estar aprobado en la spec")
    try:
        # El comando es el de la spec (aprobado al planear). Nunca se acepta uno libre.
        out = subprocess.run(command, shell=True, cwd=str(Path(args.repo).resolve()),
                             capture_output=True, text=True, timeout=args.timeout)
        code = out.returncode
    except subprocess.TimeoutExpired:
        code = 124
        warn("timeout de %ss" % args.timeout)
    sha = _git_sha(args.repo)
    row = "| %s | %s | %s | %s | %s |" % (args.criterio, today(), escape_cell(command), code, sha)
    lines = text.splitlines()
    start, end = table_after_heading(lines, "## Bitácora", "| Criterio | Fecha")
    if start is None:
        fail("la spec no tiene seccion Bitacora")
    replaced = False
    for i in range(start, end):
        if split_row(lines[i])[0] == str(args.criterio):
            lines[i] = row
            replaced = True
            break
    if not replaced:
        lines.insert(end, row)
    write_atomic(spec, "\n".join(lines) + "\n")
    print("registrado criterio %s: exit %s, commit %s" % (args.criterio, code, sha))
    if code != 0:
        sys.exit(2)


def cmd_close(args):
    fdir = features_dir(args.repo, args.dir)
    spec = find_record(fdir, args.registro)
    rid = RECORD_RE.match(spec.name).group(1)
    text = read(spec)
    if frontmatter(text).get("status") == "cerrada":
        print("ya estaba cerrada")
        return
    criteria = _criteria(text)
    if not criteria:
        fail("la spec no declara criterios de aceptacion")
    done = {row[0]: row for row in _bitacora(text)}
    missing = [c["n"] for c in criteria
               if c["n"] not in done or len(done[c["n"]]) < 4 or done[c["n"]][3] != "0"]
    if missing:
        fail("criterios sin evidencia exit 0: " + ", ".join(missing))
    if "## Rollback" not in text or not text.split("## Rollback", 1)[1].split("##", 1)[0].strip():
        fail("Rollback vacio: escribe como deshacer el cambio")
    text = set_frontmatter(text, "status", "cerrada")
    text = set_frontmatter(text, "updated", today())
    write_atomic(spec, text)
    _delete_backlog_row(fdir, rid)
    _close_index_row(fdir, rid)
    print("cerrado " + spec.name)


def _delete_backlog_row(fdir, rid):
    path, text, meta, areas = load_backlog(fdir)
    lines = text.splitlines()
    start, end = table_rows(lines, "| id | área |")
    for i in range(start, end):
        cells = split_row(lines[i])
        if len(cells) >= 5 and cells[4] == rid:
            del lines[i]
            write_atomic(path, "\n".join(lines) + "\n")
            return True
    return False


def _close_index_row(fdir, rid):
    # Mueve la fila de Activas a Cerradas: el estado no puede quedar duplicado y contradictorio.
    ipath = fdir / "INDEX.md"
    if not ipath.exists():
        return
    lines = read(ipath).splitlines()
    a_start, a_end = table_after_heading(lines, "## Activas", "| Fecha | Cambio |")
    if a_start is None:
        return
    row = None
    for i in range(a_start, a_end):
        if "(" + rid + "-" in lines[i] or "[" + rid + "-" in lines[i]:
            row = split_row(lines[i])
            del lines[i]
            break
    if row is None:
        return
    row[2] = "cerrada"
    c_start, c_end = table_after_heading(lines, "## Cerradas", "| Fecha | Cambio |")
    if c_start is None:
        fail("INDEX.md sin tabla en '## Cerradas'")
    lines.insert(c_end, "| " + " | ".join(row) + " |")
    write_atomic(ipath, "\n".join(lines) + "\n")


def cmd_drop(args):
    fdir = features_dir(args.repo, args.dir)
    path, text, meta, areas = load_backlog(fdir)
    if "|" in args.reason or "\n" in args.reason:
        fail("el motivo no puede contener '|' ni saltos de linea")
    lines = text.splitlines()
    index, cells = _find_task(lines, args.id)
    if index is None:
        fail("no existe la tarea " + args.id)
    del lines[index]
    d_start, d_end = table_after_heading(lines, "## Descartadas", "| id | área | tarea | motivo |")
    if d_start is None:
        fail("el backlog no tiene la tabla de descartadas")
    lines.insert(d_end, "| " + " | ".join([cells[0], cells[1], cells[2], args.reason]) + " |")
    write_atomic(path, "\n".join(lines) + "\n")
    print("descartada " + args.id)


def cmd_check(args):
    fdir = features_dir(args.repo, args.dir)
    errors = []
    path, text, meta, areas = load_backlog(fdir)
    lines = text.splitlines()
    start, end = table_rows(lines, "| id | área |")
    if start is None:
        errors.append("BACKLOG.md sin tabla abierta")
        start = end = 0
    seen = set()
    for line in lines[start:end]:
        cells = split_row(line)
        if len(cells) < 5:
            errors.append("fila del backlog con menos de 5 columnas: " + line)
            continue
        tid, area, _title, state, rid = cells[:5]
        if tid in seen:
            errors.append("ID duplicado en el backlog: " + tid)
        seen.add(tid)
        if area not in areas:
            errors.append("area desconocida en %s: %s" % (tid, area))
        if state not in STATES_OPEN:
            errors.append("estado invalido en %s: %s" % (tid, state))
        if rid != "-" and not list(fdir.glob(rid + "-*.md")):
            errors.append("registro inexistente para %s: %s" % (tid, rid))
    legacy = meta.get("legacy_through", "").strip().strip('"')
    index_text = read(fdir / "INDEX.md") if (fdir / "INDEX.md").exists() else ""
    records = [p for p in sorted(fdir.glob("*.md")) if RECORD_RE.match(p.name)]
    for rec in records:
        rid = RECORD_RE.match(rec.name).group(1)
        rtext = read(rec)
        rmeta = frontmatter(rtext)
        status = rmeta.get("status", "").strip('"')
        if rmeta.get("id", "").strip('"') not in ("", rid):
            errors.append("%s: id del frontmatter no coincide" % rec.name)
        if status not in STATES_SPEC:
            errors.append("%s: status invalido (%r)" % (rec.name, status))
        if legacy and rid <= legacy:
            continue
        if not rmeta.get("area"):
            errors.append("%s: falta area" % rec.name)
        if not rmeta.get("tarea"):
            errors.append("%s: falta tarea" % rec.name)
        if status == "cerrada":
            if rec.name not in index_text:
                errors.append("%s: cerrada y no aparece en INDEX.md" % rec.name)
            done = {row[0]: row for row in _bitacora(rtext)}
            for c in _criteria(rtext):
                row = done.get(c["n"])
                if row is None or len(row) < 4 or row[3] != "0":
                    errors.append("%s: criterio %s sin evidencia exit 0" % (rec.name, c["n"]))
            if "## Rollback" not in rtext or not rtext.split("## Rollback", 1)[1].split("##", 1)[0].strip():
                errors.append("%s: Rollback vacio" % rec.name)
    for issue in errors:
        print("ERROR: " + issue)
    if errors:
        sys.exit(1)
    print("check OK (%d registros, %d tareas abiertas)" % (len(records), len(seen)))


def cmd_adopt(args):
    fdir = features_dir(args.repo, args.dir)
    if not backlog_path(fdir).exists():
        if args.dry_run:
            print("crearia BACKLOG.md")
        else:
            cmd_init(argparse.Namespace(repo=args.repo, dir=args.dir, areas=DEFAULT_AREAS))
    records = [p for p in sorted(fdir.glob("*.md")) if RECORD_RE.match(p.name)]
    max_id = ""
    changes = 0
    for rec in records:
        rid = RECORD_RE.match(rec.name).group(1)
        max_id = max(max_id, rid)
        text = read(rec)
        meta = frontmatter(text)
        new = text
        if not meta.get("area"):
            new = set_frontmatter(new, "area", args.default_area)
        if not meta.get("tarea"):
            new = set_frontmatter(new, "tarea", "-")
        if new != text:
            changes += 1
            if args.dry_run:
                print("anadiria area/tarea a " + rec.name)
            else:
                write_atomic(rec, new)
    if not args.dry_run and max_id:
        path, text, meta, areas = load_backlog(fdir)
        if not meta.get("legacy_through", "").strip('"'):
            write_atomic(path, set_frontmatter(text, "legacy_through", max_id))
    for sub in (".opencode/skills", ".opencode/agents"):
        local = Path(args.repo).resolve() / sub
        if local.exists():
            warn("reglas locales que anulan las globales: " + sub)
    print("adopt: %d registros, %d cambios" % (len(records), changes))


def build_parser():
    p = argparse.ArgumentParser(prog="trace.py", description="Trazabilidad portable: backlog, expedientes y registro")
    p.add_argument("--repo", default=".", help="raiz del proyecto (default: .)")
    p.add_argument("--dir", default="docs/features", help="carpeta de registros (default: docs/features)")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("init", help="crea BACKLOG.md e INDEX.md")
    s.add_argument("--areas", default=DEFAULT_AREAS)
    s.set_defaults(func=cmd_init)

    s = sub.add_parser("task", help="anade una tarea al backlog")
    s.add_argument("title")
    s.add_argument("--area", required=True)
    s.set_defaults(func=cmd_task)

    s = sub.add_parser("start", help="crea el expediente de una tarea")
    s.add_argument("--slug", required=True)
    s.add_argument("--title", required=True)
    s.add_argument("--summary", default="")
    s.add_argument("--area", default="")
    s.add_argument("--tarea", default="")
    s.add_argument("--status", default="")
    s.add_argument("--dry-run", action="store_true")
    s.set_defaults(func=cmd_start)

    s = sub.add_parser("record", help="ejecuta el comando de un criterio y anota la evidencia")
    s.add_argument("--registro", required=True)
    s.add_argument("--criterio", required=True)
    s.add_argument("--timeout", type=int, default=300)
    s.add_argument("--yes", action="store_true")
    s.set_defaults(func=cmd_record)

    s = sub.add_parser("close", help="cierra un expediente con evidencia completa")
    s.add_argument("--registro", required=True)
    s.set_defaults(func=cmd_close)

    s = sub.add_parser("drop", help="descarta una tarea abierta")
    s.add_argument("--id", required=True)
    s.add_argument("--reason", required=True)
    s.set_defaults(func=cmd_drop)

    s = sub.add_parser("check", help="valida backlog, expedientes y registro")
    s.set_defaults(func=cmd_check)

    s = sub.add_parser("adopt", help="prepara un proyecto con registros existentes")
    s.add_argument("--default-area", default="sin-clasificar")
    s.add_argument("--dry-run", action="store_true")
    s.set_defaults(func=cmd_adopt)
    return p


def main(argv=None):
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
