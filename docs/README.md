# Documentacion del repositorio

> **Para quién:** dev junior con TDAH — índice corto; leer en 1 min.
> **Para qué:** saber dónde está cada cosa sin bucear el repo.

| Carpeta | Qué hay | Cuándo la necesitas |
| --- | --- | --- |
| [harness/](harness/) | [estado-actual.md](harness/estado-actual.md) (inventario) · [pipeline.md](harness/pipeline.md) (flujo operativo) · [notion.md](harness/notion.md) (integración Notion) · [stitch.md](harness/stitch.md) (integración Stitch) · [changelog.md](harness/changelog.md) (historial) · [presupuestos.md](harness/presupuestos.md) (topes) · [test-carga-harness.md](harness/test-carga-harness.md) (registro de un test de carga post-reinicio) · [auditoria-subagentes.md](harness/auditoria-subagentes.md) (roles y permisos reales) · [auditoria-complementacion.md](harness/auditoria-complementacion.md) (huecos de cobertura backend) · [auditoria-v2.md](harness/auditoria-v2.md) (histórica) | Cambiaste agentes, skills, permisos o el presupuesto del harness |
| [project-brain/](project-brain/) | Cerebro documental: [INDEX.md](project-brain/INDEX.md) (el índice que se carga siempre) · [ARCHITECTURE.md](project-brain/ARCHITECTURE.md) (capas e invariantes) · informes de evaluación de experiencia (skill `evaluacion-experiencia`) en `ux-evaluacion/` al crearse | Estás con dudas de "qué hay, dónde vive o qué no se rompe" |
| [guias/](guias/) | Procedimientos paso a paso (p. ej. [downgrade-opencode-v1.md](guias/downgrade-opencode-v1.md) para volver a OpenCode V1) | necesitas ejecutar un procedimiento o rehacer una instalación |
| [features/](features/) | Registro DDR: índice en [INDEX.md](features/INDEX.md); una feature-spec por feature multi-sesión (`NNN-<slug>.md`, umbral >1 sesión o ≥2 agentes) y tarjetas cortas opt-in para cambios funcionales de una sesión. Plantillas en [FEATURE-SPEC.md](../.opencode/skills/documentacion/references/FEATURE-SPEC.md) y [FEATURE-CARD.md](../.opencode/skills/documentacion/references/FEATURE-CARD.md) | Definir, reanudar o cerrar una feature que dura más de una sesión |
| [specs/](specs/) | Archivo histórico: `001` (ahorro de tokens), `002` (review de UI) y `003` (retirada de sdd-lite); `004` es un runbook one-off de instalación de la skill `evaluacion-experiencia` (cherry-pick/patch/copia). No reabre el sistema. La documentación de features multi-sesión vive en `docs/features/` (ciclo DDR). |

**Regla:** la documentación del harness vive en `docs/harness/`, nunca dentro de `.opencode/`
(runtime: agentes, skills y commands). Excepción aceptada: cada skill puede llevar su propio
README de contexto (viaja con la skill al sincronizar a otros proyectos). El guardarraíl lo
verifica: bloquea `.opencode/Logs/` y exige `estado-actual.md` (check 8 de `harness-budget.ps1`).
