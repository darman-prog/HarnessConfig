# Trazabilidad portable (contrato)

Cómo registrar el trabajo de forma que una persona pueda auditarlo y un agente pueda retomarlo sin leer el código. El detalle de uso vive aquí; la doctrina, en `documentacion` §docs/features.

## Capas

| Capa | Dónde | Qué guarda | Dueño |
| --- | --- | --- | --- |
| Cola | `<repo>/docs/features/BACKLOG.md` | Trabajo abierto (lo que espera) | `trace.py` |
| Expediente | `<repo>/docs/features/NNN-*.md` | Intención, criterios, bitácora, rollback | `trace.py` |
| Registro | `<repo>/docs/features/INDEX.md` | Una fila por trabajo cerrado | `trace.py` |
| Decisión | `<repo>/docs/adr/NNN-*.md` | Decisiones irreversibles o globales | persona |

Un solo dueño por estado: el backlog manda mientras está abierto; el expediente manda al cerrar.

## Rol único de cada documento

Cada documento responde una sola pregunta; si dos la responden, uno es un bug de documentación.

| Documento | Pregunta única | Guarda | No guarda |
| --- | --- | --- | --- |
| `BACKLOG.md` | ¿Qué falta y en qué estado? | Trabajo abierto (lo que espera), área y enlace al registro | Detalle, evidencia, historia |
| `NNN-*.md` | ¿Qué es y cómo se comprueba? | Intención, criterios con comando, bitácora y rollback | La cola, el índice global, decisiones globales |
| `INDEX.md` | ¿Qué se cerró y dónde está? | Una fila por registro cerrado + sección de ADR | Detalle, trabajo abierto |
| `adr/NNN-*.md` | ¿Por qué se decidió así? | Contexto, decisión, consecuencias y alternativas | Tareas, pasos de implementación |
| `changelog.md` | ¿Qué cambió y cuándo? | Una fila por cambio, append-only | Estado actual, evidencia detallada |
| `NAVIGATION.md` | ¿Dónde leo sobre X? | Rutas y cuándo cargar cada doc | Contenido copiado, listas de features |
| `estado-actual.md` | ¿Qué existe hoy? | Inventario vigente | Historia |
| `ARCHITECTURE.md` | ¿Qué no debo romper? | Capas e invariantes | Procedimientos |
| `presupuestos.md` | ¿Cuáles son los topes? | Números y su porqué | Estado del repo |
| este `TRACE.md` | ¿Cómo funciona la herramienta? | Contrato, comandos, estados | Datos del proyecto |
| `docs/guias/` | ¿Cómo hago X? | Pasos | Decisiones, registros |
| `docs/specs/` | (histórico) | Archivo de solo lectura | Nada nuevo |

Cadena: `idea → BACKLOG → spec/tarjeta → INDEX → changelog`; el ADR es ortogonal (decisión) y `NAVIGATION` es el mapa.

- El estado tiene un solo dueño: abierto en el backlog, cerrado en el expediente.
- La evidencia vive en la bitácora; el changelog solo la resume con un enlace.
- `NAVIGATION` enlaza, no enumera.

Si buscas: qué falta → `BACKLOG.md`; en qué va → spec activa; qué se hizo → `INDEX.md`; por qué → `adr/`; qué cambió → `changelog.md`.

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
