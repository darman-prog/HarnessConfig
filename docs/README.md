# Documentacion del repositorio

> **Para quién:** dev junior con TDAH — índice corto; leer en 1 min.
> **Para qué:** saber dónde está cada cosa sin bucear el repo.

| Carpeta | Qué hay | Cuándo la necesitas |
| --- | --- | --- |
| [harness/](harness/) | [estado-actual.md](harness/estado-actual.md) (inventario) · [pipeline.md](harness/pipeline.md) (flujo operativo) · [notion.md](harness/notion.md) (integración Notion) · [changelog.md](harness/changelog.md) (historial) · [presupuestos.md](harness/presupuestos.md) (topes) · [auditoria-complementacion.md](harness/auditoria-complementacion.md) (huecos de cobertura backend) · [auditoria-v2.md](harness/auditoria-v2.md) (histórica) | Cambiaste agentes, skills, permisos o el presupuesto del harness |
| [project-brain/](project-brain/) | Cerebro documental: [INDEX.md](project-brain/INDEX.md) (el índice que se carga siempre) · [ARCHITECTURE.md](project-brain/ARCHITECTURE.md) (capas e invariantes) | Estás con dudas de "qué hay, dónde vive o qué no se rompe" |
| [features/](features/) | Ciclo DDR: una feature-spec por feature multi-sesión (`NNN-<slug>.md`, umbral >1 sesión o ≥2 agentes); plantilla y ciclo de vida en [FEATURE-SPEC.md](../.opencode/skills/documentacion/references/FEATURE-SPEC.md) | Definir, reanudar o cerrar una feature que dura más de una sesión |
| [specs/](specs/) | Archivo histórico: `001` (ahorro de tokens), `002` (review de UI) y `003` (retirada de sdd-lite); `004` es un runbook one-off de instalación de la skill `evaluacion-experiencia` (cherry-pick/patch/copia). No reabre el sistema. La documentación de features multi-sesión vive en `docs/features/` (ciclo DDR). |

**Regla:** la documentación del harness vive en `docs/harness/`, nunca dentro de `.opencode/`
(que es la carpeta de runtime: agentes, skills y commands). El guardarraíl lo verifica.
