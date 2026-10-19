---
id: 005
status: cerrada
created: 2026-10-18
updated: 2026-10-18
---

# Feature 005 — Simplificación OpenCode-only (una sola raíz)

> Dejar el harness con un único árbol de skills y sin esquinas para otro agente.

## Objetivo
Que el repo tenga una sola raíz de skills (`.opencode/skills`), una sola config y un guardarraíl sin unión de carpetas: menos piezas que mantener y menos formas de romperse.

## Contexto
La feature 003 montó la convivencia con Antigravity (3 ficheros, skills compartidas en `.agents/skills`, `skills.paths`, espejo global y `docs/harness/antigravity.md`). El usuario decidió que `GEMINI.md` no pertenece a este harness: su agente genera el suyo, y aquí no hace falta acomodarlo.

## Alcance
| Incluye | Excluye |
|---|---|
| `.agents/skills` disuelto en `.opencode/skills`; `skills.paths` fuera; sync y guardarraíl a raíz única; docs de convivencia retirada | El deny de `GEMINI.md` (se queda como defensa); `docs/features/003` (histórico cerrado) |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | Una sola raíz de skills con 38 `SKILL.md` | guardarraíl + `git status` |
| 2 | `opencode.json` sin `skills.paths`; `instructions` solo `OPENCODE.md` | config + guardarraíl (bloque 12) |
| 3 | `sync-global.ps1` sin espejo `~/.agents/skills` | sync exit 0 con identidad OK |
| 4 | Sin docs de convivencia vivas; `docs/harness/antigravity.md` eliminado | `grep` de Antigravity en docs vivas |
| 5 | Sin corrupción de codificación en lo tocado | escaneo de U+FFFD + guardarraíl (check 11) |

## Pasos
1. `git mv` de las 2 skills a `.opencode/skills` y borrado de `GEMINI.md` (untracked).
2. `opencode.json`: quitar `skills.paths`.
3. `sync-global.ps1`: quitar espejo compartido y control de duplicados.
4. `harness-budget.ps1`: raíz única y bloque 12 sin `GEMINI.md` (solo el deny).
5. Docs: README, project-brain, estado-actual, presupuestos; borrar `antigravity.md`.
6. Verificar guardarraíl, smokes y sync; cerrar esta spec.

## Evidencia (al cerrar)
1. Una sola raíz: `.opencode/skills/` con 38 `SKILL.md`; `.agents/` eliminado; `git status` muestra el `git mv` de las 2 skills (historial preservado).
2. `opencode.json`: sin `skills.paths`; `instructions: ["OPENCODE.md"]`; el deny de `*GEMINI.md` sigue en `permission.read`/`glob`.
3. `sync-global.ps1`: sin espejo `~/.agents/skills`; el dry-run/espejo normal queda en 3 carpetas (skills, agents, commands).
4. Guardarraíl exit 0: `OPENCODE.md` 62/75 · `AGENTS.md` 18/35 · 38 skills · agentes 317/350 · bloque 12 sin `GEMINI.md`.
5. Docs: `docs/harness/antigravity.md` eliminado; filas limpias en README, project-brain, estado-actual y presupuestos; el histórico (feature 003 y changelog) intacto.
6. Integridad: escaneo de todo el repo sin U+FFFD ni ficheros no-UTF8; el guardarraíl (check 11) en verde.
7. Sync `-ForcePurge` con identidad OK y smokes de ruteo PASS.

## Cierre
- Fila resumen del changelog (2026-10-18b) y entrada detallada; sin ADR (reversible con `git revert`).
