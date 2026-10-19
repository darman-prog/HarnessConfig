---
status: vigente
last_reviewed: 2026-10-15
---

# Registro de features implementadas

Lectura rápida por unidad funcional implementada. Cada fila enlaza su evidencia;
el detalle vive en la spec o tarjeta correspondiente, no en este índice.

## Activas

| Fecha | Cambio | Estado | Alcance | Registro | Evidencia |
|---|---|---|---|---|---|
| 2026-10-15 | Registro funcional e índice | cerrada | Índice, tarjeta single-session y plantilla visual | [002-registro-funcional-features.md](002-registro-funcional-features.md) | tarjeta cerrada + commit `0f794f5` |
| 2026-10-18 | Convivencia OpenCode ↔ Antigravity | cerrada | 3 ficheros, skills compartidos, deny GEMINI.md | [003-convivencia-opencode-antigravity.md](003-convivencia-opencode-antigravity.md) | cerrada con evidencia |
| 2026-10-18 | Tokens y fiabilidad de ruteo | cerrada | Medición, tope chars/4, smokes, verify | [004-mejoras-tokens-ruteo.md](004-mejoras-tokens-ruteo.md) | cerrada con evidencia |
| 2026-10-18 | Simplificación OpenCode-only | cerrada | Una sola raíz de skills, sin docs de convivencia | [005-simplificacion-opencode-only.md](005-simplificacion-opencode-only.md) | cerrada con evidencia |

## Cerradas

| Fecha | Cambio | Estado | Alcance | Registro | Evidencia |
|---|---|---|---|---|---|
| 2026-10-14 | Ciclo DDR de feature-spec | cerrada | Fuente multi-sesión, Skill Gate y tope 75 | [001-ciclo-ddr-feature-spec.md](001-ciclo-ddr-feature-spec.md) | criterios verificados |

## Reglas

- Una fila por unidad funcional implementada; los micro-fixes quedan en el changelog.
- Las tarjetas single-session son opt-in y tienen 20 líneas o menos.
- Las feature-specs multi-sesión tienen 45 líneas o menos.
- Si las secciones activas y cerradas superan 40 filas, mueve las cerradas antiguas a `ARCHIVE.md` y conserva aquí solo el resumen.

## Archivado

Vacío por ahora. `ARCHIVE.md` aún no existe; se creará append-only cuando el índice necesite poda.