---
id: 004
status: cerrada
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
1. Tope de tokens: el guardarraíl calcula `chars/4` de `OPENCODE.md` + `AGENTS.md` + las 38 descripciones y falla sobre 4250 (medido 3685 el 2026-10-18, holgura ~15%). Constante `MAX_TOKENS_INSTRUCCIONES` en `presupuestos.md` y en el script.
2. Medicion fiable: `measure-tokens.js` agrega por sesion (el input real viaja en `cache.write`/`cache.read`, no en `input`), tolera varias formas del evento y sale con error si no parsea ningun `step_finish`. Reporte: `docs/harness/mediciones/2026-10-18.json` (input nuevo+write ~13-18k, cache read 47%, $0.011 en 3 sesiones).
3. Smokes de ruteo: `scripts/smoke-routing.ps1` con 16 casos (10 de gatillo + 6 adyacentes) y exit code; resultado 16/16 PASS.
4. Gating: 10 skills con "No usar cuando" (`testing`, `code-quality`, `tdd`, `refactoring`, `debugging`, `ui-ux`, `documentacion`, `contexto-proyecto`, `evaluacion-experiencia`, `analisis-datos`), cada uno con su caso adyacente en el smoke.
5. Compactacion: 2 directivas en `OPENCODE.md` (conservar ficheros modificados, comandos y decisiones al compactar; y medir antes de tocar `prune`/`reserved`).
6. Medicion periodica: hay medicion base guardada (2026-10-18). El reporte mensual (cache read/write e input/output por sesion) queda como tarea recurrente del ciclo mensual, no como cambio de codigo.
7. Gate de poda: no hay telemetria nativa de activaciones; el conteo sale de los smokes (16 casos) y de los logs de sesion. Revisar el 2026-11-17: si 3 o mas skills nunca se activan, evaluarlas para fusion o retirada.

## Cierre
- Fila resumen del changelog (2026-10-18c) y entrada detallada; sin ADR (reversible).
