---
id: 007
status: cerrada
created: 2026-10-18
updated: 2026-10-18
area: docs
tarea: -
---

# Feature 007 — Consolidación de política (un umbral, un flujo corto)

> Que una regla se escriba una vez y que el pipeline se lea en una pantalla.

## Objetivo
Un solo lugar donde vive el umbral de feature-spec y un `pipeline.md` que se lee entero sin scroll infinito.

## Contexto
El umbral ">1 sesión o ≥2 agentes" estaba repetido en 6 ficheros vivos: cambiarlo obligaba a tocar todos y tarde aparecía alguna copia desfasada. `pipeline.md` tenía 255 líneas para explicar un flujo de 5 fases.

## Alcance
| Incluye | Excluye |
|---|---|
| Umbral con canon en `documentacion` §docs/features y punteros en el resto; `pipeline.md` (flujo, 51 líneas) + `pipeline-referencia.md` (detalle, 228) | Reescribir el contenido del pipeline |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | El umbral se define en 1 sitio y el resto apunta | `grep` en ficheros vivos: 1 definición + historial |
| 2 | `pipeline.md` cabe en una pantalla | 51 líneas |
| 3 | La referencia conserva las anclas | `sec-3`..`sec-10` en `pipeline-referencia.md` |
| 4 | Nada roto | guardarraíl exit 0 + `verify.ps1` |

## Evidencia (al cerrar)
1. Umbral: canon en `documentacion/SKILL.md` §docs/features; plan, build, calidad-cierre, contexto-proyecto, pipeline (x2), README, índice de features, estado-actual, ARCHITECTURE y las plantillas apuntan. En ficheros vivos queda 1 definición (el canon) + 4 menciones en el changelog (histórico, append-only).
2. Split: `pipeline.md` 255 → 51 líneas (cabecera + diagrama + tabla de 5 fases + punteros); `pipeline-referencia.md` nuevo con las fases en detalle y las secciones 3-10.
3. Anclas: `sec-3`..`sec-10` intactas en la referencia; los `click` del diagrama en `pipeline.md` apuntan ahora a `pipeline-referencia.md#sec-*` (antes eran locales). Ningún doc enlaza con ancla al pipeline.
4. Guardarraíl exit 0 y `verify.ps1` en verde.

## Cierre
- Fila resumen del changelog (2026-10-18e); sin ADR (reversible).
