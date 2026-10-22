---
id: 008
status: cerrada
created: 2026-10-18
updated: 2026-10-18
area: harness
tarea: -
---

# Feature 008 — Plantilla vs proyectos: una decisión y un runbook

> Saber si el harness vive solo aquí o si los proyectos se migran, y con qué pasos.

## Objetivo
Decidir el alcance del harness (solo plantilla o también los proyectos) y dejar el procedimiento escrito si se migra.

## Contexto
El repo es la plantilla; ~10 proyectos ya consumieron la fila del Skill Gate y el guardarraíl. Desde el 2026-10-18 el esquema cambió (3 ficheros → 2, skills en una raíz, umbral con canon). Esos proyectos quedaron con el esquema anterior: el harness evoluciona, ellos no.

## Alcance
| Incluye | Excluye |
|---|---|
| Decisión de alcance + runbook de migración por proyecto | Migrar los proyectos ahora (queda como paso manual del usuario) |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | La decisión de alcance está escrita y es inequívoca | `docs/harness/` + changelog |
| 2 | Existe un runbook que un proyecto puede seguir sin ayuda | guía de migración |
| 3 | El guardarraíl y `verify` siguen verdes | salida de `verify.ps1` |

## Pasos
1. Decidir alcance y escribirlo.
2. Escribir la guía de migración por proyecto.
3. Verificar y cerrar.

## Evidencia (al cerrar)
1. Decision: el harness es **solo la plantilla** (estado-actual.md, seccion de pendientes). Los proyectos no se migran en bloque: reciben las skills por el global y migran su esquema cuando toque.
2. Runbook: `docs/guias/migrar-proyecto-al-harness.md` (6 pasos + que cambia respecto al esquema anterior + nota sobre skills globales).
3. Verificacion: guardarrail exit 0 y `verify.ps1` en verde (identidad global OK, smokes 16/16).

## Cierre
- Fila resumen del changelog (2026-10-18f) y entrada detallada; sin ADR (reversible).
