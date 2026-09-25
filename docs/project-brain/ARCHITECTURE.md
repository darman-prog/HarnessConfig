---
status: vigente
last_reviewed: 2026-09-25
confidence: confirmado
source: verificado contra el repo en el commit 2e5a08d
---

# Arquitectura del harness

> **Para qué:** saber dónde vive cada responsibility y qué invariantes se rompen si tocas algo.
> **Cifras:** salen de [presupuestos.md](../harness/presupuestos.md) y las implementa `scripts/harness-budget.ps1`.

## Capas

| Capa | Dónde vive | Qué contiene | Quién la lee |
| --- | --- | --- | --- |
| Bootstrap | `AGENTS.md` (60 líneas) | tabla del Skill Gate, estilo de respuesta, reglas de contexto | todos los agentes, en cada sesión |
| Doctrina | `.opencode/skills/` (34) | una skill por dominio, con `references/` bajo demanda | el agente que la carga |
| Contratos | `.opencode/agents/` (8, 310 líneas) | rol, modo, color y permisos en el frontmatter | el runtime de opencode |
| Comandos | `.opencode/commands/` (1) | slash commands | el usuario |
| Verificación | `scripts/harness-budget.ps1`, `sync-global.ps1` | guardarraíl de 9 bloques y espejo repo → global | el ejecutor y el sync |
| Documentación | `docs/` | `harness/` (vigente), `specs/` (historia) y este cerebro | personas y agentes |

## Invariantes

Si uno cae, el harness se pudre en silencio. Los verifica `harness-budget.ps1` (exit 1) o el sync.

1. **Presupuesto**: todo lo de arriba dentro de los topes de `presupuestos.md`; manda el guardarraíl, no el criterio.
2. **Espejo**: `~/.config/opencode/{skills,agents,commands}` es copia exacta del repo — el sync compara texto normalizado y número de archivos.
3. **Permisos**: `plan`, `backend-expert` y `tester` nunca editan; `auditor` solo `*.md`; los subagents no se invocan entre sí; `external_directory` no puede abrir `*`.
4. **Fail-closed**: sin `name`/`description` en el frontmatter la skill no se anuncia; sin guardarraíl el sync no copia.
5. **Sin hot-reload**: todo lo anterior se carga al arrancar; tras editar, reiniciar opencode.
6. **Un dato, un lugar**: los topes en `presupuestos.md`, el ruteo en `AGENTS.md`, la política de permisos en el global, el criterio de un cambio en el changelog.

## Flujo de una tarea

`usuario` → primario (`build` | `plan`) → subagents (`Task`/`@`) → `calidad-cierre` → commit con tu "sí" → `sync-global.ps1` → reiniciar.

El detalle por actor está en [pipeline.md](../harness/pipeline.md).

## Dónde no va nada

- **Planes, checklists y specs**: el plan vive en la entrega de `plan`; su registro, en el changelog. El sistema de specs se retiró el 2026-09-25.
- **Decisiones de arquitectura**: van a `docs/adr/` el día que haya una (`documentacion` §Qué se documenta).
- **Lógica del harness duplicada**: se enlaza, no se copia (regla de la propia [pipeline.md](../harness/pipeline.md)).
