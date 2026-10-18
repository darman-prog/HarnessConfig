---
id: 004
status: en-curso
created: 2026-10-18
updated: 2026-10-18
---

# Feature 004 — Tokens y fiabilidad de ruteo (solo OpenCode hoy)

> Medir el coste real, verificar la activación de skills con smokes y fijar topes en tokens.

## Objetivo
Que el guardarraíl mida tokens (no solo líneas) y que el ruteo se verifique en runtime, no solo por keywords estáticas.

## Contexto
La medición 2026-10-18 dio "input avg 6" (parser incompatible). Los probes cubren keywords, no activación real. Hay 47 probes y 38 skills sin conteo de uso.

## Alcance
| Incluye | Excluye |
|---|---|
| Tope chars/4 medido, fix de measure-tokens, suite de smokes, verify.ps1 | Tool search, fork, MCP CRUD, prompts globales |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | Guardarraíl calcula tokens = chars/4 de OPENCODE+AGENTS+38 descripciones y falla si supera 4250 | salida del guardarraíl |
| 2 | `measure-tokens.js` reporta input/output/cache coherentes por sesión | `mediciones/YYYY-MM-DD.json` |
| 3 | `smoke-routing.ps1` corre 10 casos y devuelve PASS/FAIL con exit code | salida del script |
| 4 | 10 skills con "No usar cuando" + caso adyacente en el smoke | diff de skills |
| 5 | 2 directivas de compactación en OPENCODE.md; `prune/reserved` documentado | OPENCODE.md, opencode.json |
| 6 | Reporte mensual de caché e input/output en changelog | fila de changelog |
| 7 | Gate de poda a 30 días con conteo de activaciones | changelog |

## Pasos
1. Medición: fix de `measure-tokens`, estimador chars/4, tope + guardarraíl.
2. Smokes: `smoke-routing.ps1` con 10 casos.
3. `verify.ps1` (+ sync) y cierre de 004 con evidencia.

## Evidencia (al cerrar)
- Pendiente.

## Cierre
- Fila resumen del changelog; sin ADR (reversible).
