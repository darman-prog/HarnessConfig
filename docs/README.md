# Documentacion del repositorio

> **Para quién:** dev junior con TDAH — índice corto; leer en 1 min.
> **Para qué:** saber dónde está cada cosa sin bucear el repo.

| Carpeta | Qué hay | Cuándo la necesitas |
| --- | --- | --- |
| [harness/](harness/) | [estado-actual.md](harness/estado-actual.md) (inventario) · [pipeline.md](harness/pipeline.md) (flujo operativo) · [notion.md](harness/notion.md) (integración Notion) · [changelog.md](harness/changelog.md) (historial) · [presupuestos.md](harness/presupuestos.md) (topes) · [auditoria-v2.md](harness/auditoria-v2.md) (histórica) | Cambiaste agentes, skills, permisos o el presupuesto del harness |
| [project-brain/](project-brain/) | Cerebro documental: [INDEX.md](project-brain/INDEX.md) (el índice que se carga siempre) · [ARCHITECTURE.md](project-brain/ARCHITECTURE.md) (capas e invariantes) | Estás con dudas de "qué hay, dónde vive o qué no se rompe" |
| [specs/](specs/) | Archivo histórico: `001` (ahorro de tokens), `002` (review de UI) y `003` (retirada de sdd-lite). El sistema de specs ya no genera planes por que en grandes sesiones genera un consumo de tokens considerables a la hora de crear muchas features se esta planeando una nueva forma de abordar el tema de de documentacion de features para menor coste de tokens |

**Regla:** la documentación del harness vive en `docs/harness/`, nunca dentro de `.opencode/`
(que es la carpeta de runtime: agentes, skills y commands). El guardarraíl lo verifica.
