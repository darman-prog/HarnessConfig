---
status: vigente
last_reviewed: 2026-10-18
---

# Registro de features implementadas

Lectura rápida por unidad funcional implementada. Cada fila enlaza su evidencia;
el detalle vive en la spec o tarjeta correspondiente, no en este índice.

## Activas

| Fecha | Cambio | Estado | Alcance | Registro | Evidencia |
|---|---|---|---|---|---|

## Cerradas

| Fecha | Cambio | Estado | Alcance | Registro | Evidencia |
|---|---|---|---|---|---|
| 2026-10-14 | Ciclo DDR de feature-spec | cerrada | Fuente multi-sesión, Skill Gate y tope 75 | [001-ciclo-ddr-feature-spec.md](001-ciclo-ddr-feature-spec.md) | criterios verificados |
| 2026-10-15 | Registro funcional e índice | cerrada | Índice, tarjeta single-session y plantilla visual | [002-registro-funcional-features.md](002-registro-funcional-features.md) | tarjeta cerrada + commit `0f794f5` |
| 2026-10-18 | Convivencia OpenCode ↔ Antigravity | cerrada | 3 ficheros, skills compartidos, deny GEMINI.md | [003-convivencia-opencode-antigravity.md](003-convivencia-opencode-antigravity.md) | cerrada con evidencia |
| 2026-10-18 | Tokens y fiabilidad de ruteo | cerrada | Medición, tope chars/4, smokes, verify | [004-mejoras-tokens-ruteo.md](004-mejoras-tokens-ruteo.md) | cerrada con evidencia |
| 2026-10-18 | Consolidación de política | cerrada | Umbral con un canon y pipeline en dos ficheros | [007-consolidacion-politica.md](007-consolidacion-politica.md) | cerrada con evidencia |
| 2026-10-18 | Registro y taxonomía | cerrada | Tarjetas por defecto, ADR en el índice, glosario | [006-registro-y-taxonomia.md](006-registro-y-taxonomia.md) | cerrada con evidencia |
| 2026-10-18 | Simplificación OpenCode-only | cerrada | Una sola raíz de skills, sin docs de convivencia | [005-simplificacion-opencode-only.md](005-simplificacion-opencode-only.md) | cerrada con evidencia |

## Decisiones (ADR)

| Fecha | Decisión | Estado | Ámbito | Registro |
|---|---|---|---|---|
| 2026-09-28 | RTK como dependencia de máquina | vigente | Rendimiento/costes del harness | [ADR-001](../adr/001-rtk-dependencia-de-maquina.md) |
| 2026-10-18 | OpenCode V1.19.3 (la V2 rompe los plugins) | vigente | Versión del runtime | [ADR-002](../adr/002-Version1-opencode.md) |

## Reglas

- Una fila por unidad funcional implementada; los micro-fixes quedan en el changelog.
- Toda feature de una sesión se registra con una **tarjeta** (25 líneas o menos); una feature multi-sesión, con una **spec** (45 líneas o menos). El umbral que decide cual de las dos es el canonico: `documentacion` §docs/features.
- Una decisión irreversible o global se registra como **ADR**; un procedimiento, como guía en `docs/guias/`.
- Si las secciones activas y cerradas superan 40 filas, mueve las cerradas antiguas a `ARCHIVE.md` y conserva aquí solo el resumen.

## Archivado

Vacío por ahora. `ARCHIVE.md` aún no existe; se creará append-only cuando el índice necesite poda.
