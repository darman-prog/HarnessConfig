---
id: 003
status: cerrada
created: 2026-10-18
updated: 2026-10-18
---

# Feature 003 — Convivencia OpenCode ↔ Antigravity (3 ficheros + skills compartidos)

> Desacoplar los dos harness en el mismo repo: AGENTS.md agnóstico, OPENCODE.md para OpenCode, GEMINI.md para Antigravity; skills compartidas en .agents/skills/. Sin duplicación de inyección ni colisiones de Skill Gate.

## Objetivo
Que OpenCode y Antigravity convivan en el repo sin leerse las reglas del otro: cada uno inyecta el agnóstico más su fichero propio, y las 2 skills transversales viven una sola vez en `.agents/skills/`.

## Contexto
Antigravity inyecta `AGENTS.md`+`GEMINI.md` de raíz de forma always-on e insalvable desde su lado; OpenCode hoy centraliza todo en `AGENTS.md`. Compartir el fichero duplica tokens y colisiona Skill Gates. La doc oficial de ambos confirma el mecanismo.

## Alcance
| Incluye | Excluye |
|---|---|
| `OPENCODE.md` nuevo + `AGENTS.md` recortado a agnóstico + `instructions` solo a OPENCODE.md | Crear el `GEMINI.md` (lo aporta el usuario con Antigravity) |
| `git mv` de `uso-eficiente` y `comunicacion-asertiva` a `.agents/skills/` + `skills.paths` + espejo global | Migrar los ~10 proyectos (runbook en `antigravity.md`) |
| Guardarraíl: rutas duales, check de no-duplicados, bloque 12 condicional, regex de precedencia | Cambiar topes existentes (solo se añaden los 3 nuevos) |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | Sin `AGENTS.md` con Skill Gate; `OPENCODE.md` lo contiene | guardarraíl exit 0 + `grep` con lista blanca |
| 2 | `instructions` declara solo `OPENCODE.md` | `.opencode/opencode.json:3` |
| 3 | Cero skills duplicados entre rutas y espejos | check 12 + verificación post-sync |
| 4 | `GEMINI.md` legible es denegado; `.env` sigue denegado | fixture de permiso |
| 5 | Antigravity no inyecta reglas OpenCode | redacción dual + runbook documentado |

## Pasos
1. Crear `OPENCODE.md`, recortar `AGENTS.md`, ajustar config/guardarraíl/measure + commit.
2. Sweep de referencias a su fichero + commit.
3. Mover skills compartidos, `skills.paths`, redacción dual + commit.
4. Deny de `GEMINI.md`, `docs/harness/antigravity.md`, filas de registro + commit.
5. Bloque 12 del guardarraíl con 4 fixtures + commit.
6. Global, sync, smokes A/B, drift de estado-actual, cierre + commit.

## Cierre
- Fila resumen del changelog (2026-10-18).
- Sin ADR: decisión reversible por `git revert` + `sync-global.ps1 -ForcePurge`.

## Evidencia de cierre
1. `OPENCODE.md` 62/75 y `AGENTS.md` agnóstico 18/35; `grep` de Skill Gate fuera de `AGENTS.md` = 0 (salvo histórico y vendor).
2. `instructions: ["OPENCODE.md"]` (+ perfiles QA/Notion); guardarraíl bloque 12 verde.
3. Cero duplicados: guardarraíl (unión) + `sync-global.ps1` con espejo `.agents/skills` e identidad OK; 38 skills (36+2).
4. Fixtures: sin deny → exit 1; con deny + `GEMINI.md` presente → PASS con deny; `.env` sigue denegado.
5. Simetría documentada en `docs/harness/antigravity.md` (Antigravity lee el agnóstico por diseño; no se toca su lado).
6. Smokes `opencode run` PASS (skills movidas, deny con rehúso de bypass rechazado); A/B de tokens no concluyente (medición descartada, no commiteada).
