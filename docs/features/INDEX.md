---
status: vigente
last_reviewed: 2026-10-19
---

# Registro de features implementadas

Lectura rápida por unidad funcional implementada. Cada fila enlaza su evidencia;
el detalle vive en la spec o tarjeta correspondiente, no en este índice.
El trabajo abierto vive en `BACKLOG.md`; al cerrar, su fila se borra y queda este registro.

## Activas

| Fecha | Cambio | Estado | Área | Alcance | Registro | Evidencia |
|---|---|---|---|---|---|---|

## Cerradas

| Fecha | Cambio | Estado | Área | Alcance | Registro | Evidencia |
|---|---|---|---|---|---|---|
| 2026-10-14 | Ciclo DDR de feature-spec | cerrada | docs | Fuente multi-sesión, Skill Gate y tope 75 | [001-ciclo-ddr-feature-spec.md](001-ciclo-ddr-feature-spec.md) | criterios verificados |
| 2026-10-15 | Registro funcional e índice | cerrada | docs | Índice, tarjeta single-session y plantilla visual | [002-registro-funcional-features.md](002-registro-funcional-features.md) | tarjeta cerrada + commit `0f794f5` |
| 2026-10-18 | Convivencia OpenCode ↔ Antigravity | cerrada (superada por 005) | harness | 3 ficheros y skills compartidos | [003-convivencia-opencode-antigravity.md](003-convivencia-opencode-antigravity.md) | cerrada con evidencia |
| 2026-10-18 | Tokens y fiabilidad de ruteo | cerrada | harness | Medición, tope chars/4, smokes, verify | [004-mejoras-tokens-ruteo.md](004-mejoras-tokens-ruteo.md) | cerrada con evidencia |
| 2026-10-18 | Plantilla vs proyectos | cerrada | harness | Decisión de alcance + runbook de migración | [008-plantilla-vs-proyectos.md](008-plantilla-vs-proyectos.md) | cerrada con evidencia |
| 2026-10-18 | Consolidación de política | cerrada | docs | Umbral con un canon y pipeline en dos ficheros | [007-consolidacion-politica.md](007-consolidacion-politica.md) | cerrada con evidencia |
| 2026-10-18 | Registro y taxonomía | cerrada | docs | Tarjetas por defecto, ADR en el índice, glosario | [006-registro-y-taxonomia.md](006-registro-y-taxonomia.md) | cerrada con evidencia |
| 2026-10-18 | Simplificación OpenCode-only | cerrada | harness | Una sola raíz de skills, sin docs de convivencia | [005-simplificacion-opencode-only.md](005-simplificacion-opencode-only.md) | cerrada con evidencia |
| 2026-10-19 | Recorte de tokens en descripciones y ruteo | cerrada | harness | 37 descripciones + tabla del Skill Gate | [009-recorte-tokens-descripciones.md](009-recorte-tokens-descripciones.md) | guardarraíl exit 0; 3719 → 2228 tokens |
| 2026-10-19 | Gate anti-slop en el cierre | cerrada | harness | DoD, `calidad-cierre` y preset High-Craft | [010-gate-anti-slop.md](010-gate-anti-slop.md) | guardarraíl exit 0 |
| 2026-10-22 | Trazabilidad portable y auditoria | cerrada | harness | Pendiente de detallar | [011-trazabilidad-portable.md](011-trazabilidad-portable.md) | - |

## Decisiones (ADR)

| Fecha | Decisión | Estado | Ámbito | Registro |
|---|---|---|---|---|
| 2026-09-28 | RTK como dependencia de máquina | vigente | Rendimiento/costes del harness | [ADR-001](../adr/001-rtk-dependencia-de-maquina.md) |
| 2026-10-18 | OpenCode V1.19.3 (la V2 rompe los plugins) | vigente | Versión del runtime | [ADR-002](../adr/002-Version1-opencode.md) |
| 2026-10-19 | Respaldos de `opencode.db`: fuera del repo, sin credenciales y verificados | vigente | Persistencia local y privacidad | [ADR-003](../adr/003-retencion-respaldos-opencode.md) |

## Reglas

- Una fila por unidad funcional implementada; los micro-fixes quedan en el changelog.
- El trabajo abierto vive en `BACKLOG.md`; al cerrar, la fila se borra y el registro conserva `tarea: B-NNN`.
- Un cambio auditable usa **spec** (60 líneas o menos, con bitácora por criterio); uno pequeño, **tarjeta** (25 líneas o menos). El umbral canónico: `documentacion` §docs/features.
- Toda spec o tarjeta declara `area` y `tarea` (`-` si no vino del backlog).
- Una decisión irreversible o global se registra como **ADR**; un procedimiento, como guía en `docs/guias/`.
- Si las secciones activas y cerradas superan 40 filas, mueve las cerradas antiguas a `ARCHIVE.md` y conserva aquí solo el resumen.

## Archivado

Vacío por ahora. `ARCHIVE.md` aún no existe; se creará append-only cuando el índice necesite poda.
