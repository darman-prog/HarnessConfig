---
status: vigente
last_reviewed: 2026-10-22
confidence: confirmado
source: verificado contra el repo el 2026-10-22
---

# Arquitectura del harness

> **Para qué:** saber dónde vive cada responsibility y qué invariantes se rompen si tocas algo.
> **Cifras:** salen de [presupuestos.md](../harness/presupuestos.md) y las implementa `scripts/harness-budget.ps1`.

## Capas

| Capa | Dónde vive | Qué contiene | Quién la lee |
| --- | --- | --- | --- |
| Bootstrap | `OPENCODE.md` + `AGENTS.md` (revisar topes en `presupuestos.md`) | Skill Gate + estilo en OPENCODE.md; contexto agnóstico en AGENTS.md | todos los agentes, en cada sesión |
| Doctrina | `.opencode/skills/` (38) | skills por tarea/dominio; referencias bajo demanda | el agente que la carga |
| Contratos | `.opencode/agents/` (8, 320 líneas) | rol, modo, color y permisos en el frontmatter | el runtime de opencode |
| Comandos | `.opencode/commands/` (1) | slash commands | el usuario |
| Verificación | `scripts/harness-budget.ps1`, `scripts/verify.ps1`, `scripts/smoke-routing.ps1`, `sync-global.ps1` | guardarraíl y espejo repo → global | el ejecutor y el sync |
| Documentación | `docs/` | `harness/` (vigente), `features/` (cola y registros DDR), `specs/` (historia) y este cerebro | personas y agentes |

## Invariantes

Si uno cae, el harness se pudre en silencio. Los verifica `harness-budget.ps1` (exit 1) o el sync.

1. **Presupuesto**: todo lo de arriba dentro de los topes de `presupuestos.md`; manda el guardarraíl, no el criterio.
2. **Espejo**: `~/.config/opencode/{skills,agents,commands}` es copia exacta del repo — el sync compara texto normalizado y número de archivos.
3. **Permisos**: `plan`, `backend-expert` y `tester` nunca editan; `auditor` solo `*.md`; los subagents no se invocan entre sí; `external_directory` no puede abrir `*`.
4. **Fail-closed**: sin `name`/`description` en el frontmatter la skill no se anuncia; sin guardarraíl el sync no copia.
5. **Sin hot-reload**: todo lo anterior se carga al arrancar; tras editar, reiniciar opencode.
6. **Un dato, un lugar**: los topes en `presupuestos.md`, el ruteo en `OPENCODE.md`, la política de permisos en el global, los criterios de un cambio auditable en su spec (`docs/features/`) y el resto de cambios en el changelog.
7. **Trazabilidad**: el trabajo abierto vive en `docs/features/BACKLOG.md`; la evidencia por criterio, en la bitácora de la spec; al cerrar, la fila se borra y el registro conserva `tarea: B-NNN`. Un estado no se escribe en dos sitios.

## Flujo de una tarea

`usuario` → primario (`build` | `plan`) → subagents (`Task`/`@`) → `calidad-cierre` → commit con tu "sí" → `sync-global.ps1` → reiniciar.

El detalle por actor está en [pipeline.md](../harness/pipeline.md).

## Dónde no va nada

- **Planes y specs**: el plan vive en la entrega de `plan` y su registro, en el changelog; el cambio auditable (umbral canonico: `documentacion` §docs/features) vive en `docs/features/NNN-*.md` (expediente con bitacora; plantillas en la skill `documentacion`). El sistema de specs se retiro el 2026-09-25 (001-004 quedan como archivo).
- **Decisiones de arquitectura**: van a `docs/adr/` el día que haya una (`documentacion` §Qué se documenta).
- **Lógica del harness duplicada**: se enlaza, no se copia (regla de la propia [pipeline.md](../harness/pipeline.md)).
