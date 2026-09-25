---
status: vigente
last_reviewed: 2026-09-25
confidence: confirmado
source: harness verificado en el commit 2e5a08d (ver ../harness/changelog.md)
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
| [presupuestos.md](../harness/presupuestos.md) | Los 7 topes del harness y su porqué | antes de añadir líneas, palabras o archivos | vigente |
| [changelog.md](../harness/changelog.md) | Registro append-only: un cambio por entrada, con criterios si es largo | "¿se hizo ya?", por qué algo cambió | vigente |
| [auditoria-v2.md](../harness/auditoria-v2.md) | Auditoría del 2026-09-18 | trazar por qué el harness es como es | obsoleto (histórico) |
| [specs/](../specs/) | `001` tokens, `002` review de UI, `003` retirada de sdd-lite | trazar decisiones antiguas | obsoleto (histórico) |
| [adr/](../adr/) | ADRs numerados — todavía no hay ninguno | decisión de arquitectura no trivial | vacío |

## Reglas del cerebro

- Actualización solo tras cambio verificado (`calidad-cierre`), nunca por edición.
- Solo se actualizan los documentos afectados por el cambio.
- Datos sin evidencia llevan `confidence: supuesto` y `status: pendiente`.
- Contradicción doc/código: reportar, no corregir automáticamente.
- Este índice se mantiene ≤ 60 líneas; si crece, resumir filas.
- La intención de un cambio largo vive en su fila del changelog, no aquí; las decisiones de arquitectura, en `adr/`.
