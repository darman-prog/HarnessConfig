---
status: vigente
last_reviewed: 2026-10-18
confidence: confirmado
source: harness verificado en el repo el 2026-10-18 (guardarraíl exit 0; ver ../harness/changelog.md)
---

# Contexto del proyecto — HarnessConfig (plantilla de OpenCode)

Fuente de verdad organizada. **Carga solo lo relevante; nunca todo el directorio.**
Este repo no es una app: su conocimiento vive en `docs/harness/` y este índice lo enruta.

> **Para quién:** agentes y devs — un índice de 1 min antes de bucear el repo.

## Documentos

| Doc | Contenido | Cargar cuando | Estado |
| --- | --- | --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Capas del harness, invariantes y flujo de una tarea | dónde va un cambio, qué no se rompe, permisos | vigente |
| [estado-actual.md](../harness/estado-actual.md) | Inventario vigente: agentes, skills, guardarraíl, sync, config global | "qué existe hoy", antes de tocar el harness | vigente |
| [pipeline.md](../harness/pipeline.md) | El paso a paso operativo por actor (fases 1-5) y permisos | cómo se ejecuta una tarea, quién delega a quién | vigente |
Los 8 topes del harness| [changelog.md](../harness/changelog.md) | Registro append-only: un cambio por entrada, con criterios si es largo | "¿se hizo ya?", por qué algo cambió | vigente |
| [notion.md](../harness/notion.md) | Reglas de sincronización con Notion vía MCP | perfil Notion activo y tarea en Notion | vigente |
| [stitch.md](../harness/stitch.md) | Stitch MCP global deshabilitado + activación por sesión: key, smoke y troubleshooting | activar o depurar Stitch; montar su API key | vigente |
| [auditoria-v2.md](../harness/auditoria-v2.md) | Auditoría del 2026-09-18 | trazar por qué el harness es como es | obsoleto (histórico) |
| [specs/](../specs/) | `001` tokens, `002` review de UI, `003` retirada de sdd-lite, `004` runbook de instalación | trazar decisiones antiguas | obsoleto (histórico) |
| [features/](../features/) | Registro DDR: [INDEX.md](../features/INDEX.md) con specs multi-sesión y tarjetas opt-in single-session; changelog al cerrar | definir, reanudar o cerrar una feature | vigente |
| [ADR-001](../adr/001-rtk-dependencia-de-maquina.md) | RTK como dependencia de máquina | integración o cambio de RTK | vigente |
| [ADR-002](../adr/002-Version1-opencode.md) | OpenCode V1.19.3 (la V2 rompe los plugins) | subir/bajar de versión de OpenCode | vigente |

## Reglas del cerebro

- Actualización solo tras cambio verificado (`calidad-cierre`), nunca por edición.
- Solo se actualizan los documentos afectados por el cambio.
- Datos sin evidencia llevan `confidence: supuesto` y `status: pendiente`.
- Contradicción doc/código: reportar, no corregir automáticamente.
- Este índice se mantiene ≤ 60 líneas; si crece, resumir filas.
- La intención de un cambio largo vive en su feature-spec (`../features/`), no aquí; las decisiones de arquitectura, en `adr/`.
