# Trazabilidad portable (contrato)

Cómo registrar el trabajo de forma que una persona pueda auditarlo y un agente pueda retomarlo sin leer el código. El detalle de uso vive aquí; la doctrina, en `documentacion` §docs/features.

## Capas

| Capa | Dónde | Qué guarda | Dueño |
| --- | --- | --- | --- |
| Cola | `<repo>/docs/features/BACKLOG.md` | Trabajo abierto | `trace.py` |
| Expediente | `<repo>/docs/features/NNN-*.md` | Intención, criterios, bitácora, rollback | `trace.py` |
| Registro | `<repo>/docs/features/INDEX.md` | Una fila por trabajo cerrado | `trace.py` |
| Decisión | `<repo>/docs/adr/NNN-*.md` | Decisiones irreversibles o globales | persona |

Un solo dueño por estado: el backlog manda mientras está abierto; el expediente manda al cerrar.

## Herramienta

`scripts/trace.py` dentro de esta skill. Se invoca con la ruta base que declara este `SKILL.md`; nunca con una ruta fija de `.opencode/`. Python 3.8 o superior, solo biblioteca estándar.

```text
trace.py init   --areas ui,backend,infra [--dir docs/features] [--repo .]
trace.py task   "titulo" --area ui [--repo .]
trace.py start  --slug refactor-checkout --title "Refactor del checkout" [--area ui] [--tarea B-001] [--status borrador] [--repo .]
trace.py record --registro 011 --criterio 2 --yes [--timeout 300] [--repo .]
trace.py close  --registro 011 [--repo .]
trace.py drop   --id B-001 --reason "ya no aplica" [--repo .]
trace.py check  [--repo .]
trace.py adopt  [--default-area sin-clasificar] [--dry-run] [--repo .]
```

## Estados

- Backlog: `pendiente`, `en-curso`, `bloqueada`. No existe `hecha`: al cerrar, la fila se borra y queda el expediente.
- Expediente: `borrador`, `aprobada`, `en-curso`, `bloqueada`, `cerrada`.
- `bloqueada` en el expediente exige una duda abierta escrita en `Contexto` o `Cierre`.

## Evidencia (anti-alucinación)

- `record` ejecuta **solo** el comando escrito en la columna `Comando` del criterio indicado. No acepta comandos libres.
- Requiere `--yes`: sin esa bandera, muestra el comando y aborta.
- Guarda únicamente: criterio, fecha, comando, código de salida y SHA corto. **Nunca** la salida estándar (puede contener secretos).
- Timeout por defecto: 300 s. Al vencer, registra `124`.
- Sin git en el repo: registra `sin-git` y avisa; `check` no falla por eso.
- `close` verifica que todos los criterios tengan una fila con exit `0` y que `Rollback` no esté vacío. Si algo falta, no cierra ni borra la fila del backlog.

## Formato y compatibilidad

- `BACKLOG.md` lleva frontmatter con `trace: 1`, `areas: [...]` y `legacy_through: NNN` (último registro exento de `area`/`tarea`).
- Archivos en UTF-8 sin BOM y saltos LF. Ediciones quirúrgicas: nunca se regenera un archivo existente.
- `check` rechaza versiones de esquema desconocidas y detecta IDs duplicados, estados inválidos, enlaces rotos y criterios sin evidencia.
- Proyectos antiguos: `adopt` rellena `area` y `tarea: -`, crea el backlog si falta y fija `legacy_through`.
- Proyectos con `.opencode/skills` o `.opencode/agents` locales: `adopt --dry-run` los lista, porque anulan las reglas globales.
