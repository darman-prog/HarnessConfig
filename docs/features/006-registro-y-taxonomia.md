---
id: 006
status: cerrada
created: 2026-10-18
updated: 2026-10-18
---

# Feature 006 — Registro y taxonomía (tarjetas por defecto + ADR + glosario)

> Que se entienda qué se construyó y por qué, leyendo dos ficheros y sin bucear el código.

## Objetivo
Un vocabulario sin ambigüedad (feature / tarjeta / spec / ADR / guía / changelog) y un registro que cubra también los cambios de una sola sesión.

## Contexto
El DDR solo registraba lo multi-sesión (umbral >1 sesión o ≥2 agentes). El resto vivía en el changelog, que es historial y no driver: no se puede reconstruir un cambio leyendo el changelog. Además, `adr/002` era un runbook etiquetado como ADR y `docs/adr/` no estaba indexado: la carpeta parecía vacía sin serlo.

## Alcance
| Incluye | Excluye |
|---|---|
| Tarjeta por defecto (≤25) con "Por qué" y "Dónde mirar"; spec con línea `ADR NNN \| no aplica`; índice con sección ADR; glosario y 5 respuestas de usabilidad en README | Reescribir la feature 003 o el changelog histórico |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | Toda feature de una sesión queda registrada con tarjeta | `build.md` + `calidad-cierre` lo exigen al cerrar |
| 2 | La spec declara su ADR o "no aplica" | plantilla `FEATURE-SPEC.md` |
| 3 | El índice lista features, tarjetas y ADRs en un solo sitio | `docs/features/INDEX.md` |
| 4 | Las 5 preguntas de usabilidad se responden con README + índice | test de usabilidad (abajo) |
| 5 | Sin carpetas huérfanas ni ficheros mal etiquetados | `adr/002` como ADR + guía de downgrade |

## Test de usabilidad (lectura: `docs/README.md` + `docs/features/INDEX.md`)
1. ¿Qué hace el harness y para quién? → README, línea "Qué es".
2. ¿Dónde vive una feature y cómo se cierra? → README (features) + índice (reglas y estados).
3. ¿Dónde vive una decisión y por qué no se edita? → README (adr: "no se editan").
4. ¿Qué significa "verde" y qué NO cubre? → README, línea "Verde".
5. ¿Qué hacer al cambiar skills o config? → README, línea "Tras cambiar skills o config".

## Pasos
1. Plantillas: tarjeta ≤25 con "Por qué" y "Dónde mirar"; spec con línea ADR.
2. Skills y agentes: `documentacion`, `build`, `plan`, `calidad-cierre` con la regla de la tarjeta.
3. Índice: sección "Decisiones (ADR)" y reglas nuevas; README con glosario y respuestas.
4. Verificar y cerrar.

## Evidencia (al cerrar)
1. Tarjeta por defecto: `FEATURE-CARD.md` con "Por que" y "Donde mirar" (25 lineas o menos); `build.md` crea la tarjeta al cerrar un cambio de una sesion con valor observable; `calidad-cierre` comprueba que exista spec, tarjeta o fila de micro-fix.
2. Spec con ADR: `FEATURE-SPEC.md` cierra con "Decision de arquitectura: `ADR NNN` o 'no aplica'".
3. Indice unico: `docs/features/INDEX.md` con secciones Activas, Cerradas, **Decisiones (ADR)** (001 y 002), Reglas y Archivado.
4. Test de usabilidad: las 5 preguntas se responden solo con `docs/README.md` + indice (linea "Que es", filas features/adr, "Glosario (6 palabras)", "Verde" y "Tras cambiar skills o config").
5. Sin ficheros mal etiquetados: `adr/002` reescrito como decision (Contexto/Decision/Consecuencias/Alternativas) y el procedimiento movido a `docs/guias/downgrade-opencode-v1.md`.
6. Vocabulario unico en `documentacion`, `plan.md`, `build.md`, `calidad-cierre` y `docs/README.md` (glosario). Guardarrail exit 0.

## Cierre
- Fila resumen del changelog (2026-10-18d) y entrada detallada; sin ADR (reversible).
