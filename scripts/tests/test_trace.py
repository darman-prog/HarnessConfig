# Tests del CLI de trazabilidad. Sin dependencias: stdlib unittest.
# Ejecutar con: python -B -m unittest discover -s scripts/tests -v
import importlib.util
import io
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TRACE = ROOT / ".opencode" / "skills" / "documentacion" / "scripts" / "trace.py"

spec = importlib.util.spec_from_file_location("trace", str(TRACE))
trace = importlib.util.module_from_spec(spec)
spec.loader.exec_module(trace)


class TraceTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name)
        self.fdir = self.repo / "docs" / "features"

    def tearDown(self):
        self.tmp.cleanup()

    def run_cli(self, *args):
        # Silencia la salida y devuelve el codigo de salida (SystemExit -> code).
        buf = io.StringIO()
        with redirect_stdout(buf):
            try:
                trace.main(["--repo", str(self.repo)] + list(args))
                return 0, buf.getvalue()
            except SystemExit as exc:
                return (exc.code or 0), buf.getvalue()

    def init(self):
        code, out = self.run_cli("init", "--areas", "ui,backend,infra")
        self.assertEqual(code, 0, out)
        return self.fdir / "BACKLOG.md"

    def add_task(self, title="refactor checkout", area="ui"):
        code, out = self.run_cli("task", title, "--area", area)
        self.assertEqual(code, 0, out)
        return out.strip()

    def start(self, tid, slug="refactor-checkout", title="Refactor del checkout"):
        code, out = self.run_cli("start", "--slug", slug, "--title", title,
                                 "--tarea", tid)
        self.assertEqual(code, 0, out)
        return out.strip()

    def write_criterion(self, spec_path, command="python --version"):
        text = spec_path.read_text(encoding="utf-8")
        text = text.replace("| 1 |  |  |  |", "| 1 | compila | " + command + " |  |")
        text = text.replace("## Rollback\n", "## Rollback\n`git revert HEAD`\n")
        spec_path.write_text(text, encoding="utf-8", newline="")

    def test_init_and_two_tasks(self):
        backlog = self.init()
        self.assertEqual(self.add_task(), "B-001")
        self.assertEqual(self.add_task("otra", "backend"), "B-002")
        self.assertIn("B-001", backlog.read_text(encoding="utf-8"))

    def test_duplicate_id_fails_check(self):
        backlog = self.init()
        self.add_task()
        text = backlog.read_text(encoding="utf-8")
        text = text.replace("|---|---|---|---|---|\n",
                            "|---|---|---|---|---|\n| B-001 | ui | duplicada | pendiente | - |\n", 1)
        backlog.write_text(text, encoding="utf-8", newline="")
        code, out = self.run_cli("check")
        self.assertEqual(code, 1)
        self.assertIn("duplicado", out.lower())

    def test_full_cycle(self):
        self.init()
        tid = self.add_task()
        spec_path = Path(self.start(tid))
        self.assertTrue(spec_path.exists())
        self.write_criterion(spec_path)
        code, out = self.run_cli("record", "--registro", "001", "--criterio", "1", "--yes")
        self.assertEqual(code, 0, out)
        code, out = self.run_cli("close", "--registro", "001")
        self.assertEqual(code, 0, out)
        self.assertIn("status: cerrada", spec_path.read_text(encoding="utf-8"))
        self.assertNotIn("B-001", (self.fdir / "BACKLOG.md").read_text(encoding="utf-8"))
        index = (self.fdir / "INDEX.md").read_text(encoding="utf-8")
        self.assertIn("| cerrada |", index)
        code, out = self.run_cli("check")
        self.assertEqual(code, 0, out)

    def test_close_without_evidence_fails(self):
        self.init()
        tid = self.add_task()
        spec_path = Path(self.start(tid))
        self.write_criterion(spec_path)
        code, out = self.run_cli("close", "--registro", "001")
        self.assertEqual(code, 1)
        self.assertIn("sin evidencia", out)

    def test_accented_title_roundtrip(self):
        self.init()
        tid = self.add_task("migración de índices")
        backlog = (self.fdir / "BACKLOG.md").read_text(encoding="utf-8")
        self.assertIn("migración de índices", backlog)

    def test_drop_moves_row(self):
        self.init()
        tid = self.add_task()
        code, out = self.run_cli("drop", "--id", tid, "--reason", "ya no aplica")
        self.assertEqual(code, 0, out)
        text = (self.fdir / "BACKLOG.md").read_text(encoding="utf-8")
        self.assertIn("## Descartadas", text)
        self.assertIn("ya no aplica", text)

    def test_adopt_backfills_legacy(self):
        self.fdir.mkdir(parents=True)
        legacy = self.fdir / "003-viejo.md"
        legacy.write_text("---\nid: 003\nstatus: cerrada\n---\n# Viejo\n", encoding="utf-8")
        code, out = self.run_cli("adopt")
        self.assertEqual(code, 0, out)
        text = legacy.read_text(encoding="utf-8")
        self.assertIn("area: sin-clasificar", text)
        self.assertIn("tarea: -", text)
        self.assertIn('legacy_through: 003', (self.fdir / "BACKLOG.md").read_text(encoding="utf-8"))

    def test_unknown_schema_fails(self):
        self.fdir.mkdir(parents=True)
        (self.fdir / "BACKLOG.md").write_text("---\ntrace: 99\n---\n", encoding="utf-8")
        code, out = self.run_cli("check")
        self.assertEqual(code, 1)
        self.assertIn("esquema", out)


if __name__ == "__main__":
    unittest.main()
