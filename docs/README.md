# Documentacion del repositorio

> **Para quién:** dev junior con TDAH — índice corto; leer en 1 min.
> **Para qué:** saber dónde está cada cosa sin bucear el repo.
> **Qué es:** un harness de agentes (skills, agentes, presupuesto y verificación) que se instala en tus proyectos para trabajar con contexto pequeño y cambios verificables.

| Carpeta | Qué hay | Cuándo la necesitas |
| --- | --- | --- |
| [harness/](harness/) | [estado-actual.md](harness/estado-actual.md) (inventario) · [pipeline.md](harness/pipeline.md) (flujo) · [pipeline-referencia.md](harness/pipeline-referencia.md) (detalle por sección) · [notion.md](harness/notion.md) (integración Notion) · [stitch.md](harness/stitch.md) (integración Stitch) · [changelog.md](harness/changelog.md) (historial) · [presupuestos.md](harness/presupuestos.md) (topes) · [test-carga-harness.md](harness/test-carga-harness.md) (registro de un test de carga post-reinicio) · [auditoria-subagentes.md](harness/auditoria-subagentes.md) (roles y permisos reales) · [auditoria-complementacion.md](harness/auditoria-complementacion.md) (huecos de cobertura backend) · [auditoria-v2.md](harness/auditoria-v2.md) (histórica) | Cambiaste agentes, skills, permisos o el presupuesto del harness |
| [project-brain/](project-brain/) | Cerebro documental: [NAVIGATION.md](project-brain/NAVIGATION.md) (el mapa de lectura que se carga siempre) · [ARCHITECTURE.md](project-brain/ARCHITECTURE.md) (capas e invariantes) · informes de evaluación de experiencia (skill `evaluacion-experiencia`) en `ux-evaluacion/` al crearse | Estás con dudas de "qué hay, dónde vive o qué no se rompe" |
| [guias/](guias/) | Procedimientos paso a paso: [downgrade-opencode-v1.md](guias/downgrade-opencode-v1.md) (volver a OpenCode V1) · [migrar-proyecto-al-harness.md](guias/migrar-proyecto-al-harness.md) (llevar un proyecto al esquema actual) | necesitas ejecutar un procedimiento o rehacer una instalación |
| [features/](features/) | Registro DDR: índice en [INDEX.md](features/INDEX.md); una **tarjeta** por feature de una sesión (`NNN-<slug>.md`, ≤25 líneas) y una **spec** si es multi-sesión (≤45 líneas; umbral canonico: `documentacion` §docs/features). Plantillas en [FEATURE-SPEC.md](../.opencode/skills/documentacion/references/FEATURE-SPEC.md) y [FEATURE-CARD.md](../.opencode/skills/documentacion/references/FEATURE-CARD.md) | Definir, reanudar o cerrar una feature; ver qué se construyó |
| [adr/](adr/) | Decisiones irreversibles o globales: [001](adr/001-rtk-dependencia-de-maquina.md) (RTK), [002](adr/002-Version1-opencode.md) (OpenCode V1), [003](adr/003-retencion-respaldos-opencode.md) (respaldos de la base). No se editan: una decisión nueva crea otro ADR | Saber por qué el harness es como es |
| [specs/](specs/) | Archivo histórico: `001` (ahorro de tokens), `002` (review de UI) y `003` (retirada de sdd-lite); `004` es un runbook one-off de instalación de la skill `evaluacion-experiencia` (cherry-pick/patch/copia). No reabre el sistema. La documentación de features vive en `docs/features/` (ciclo DDR). |

**Glosario (6 palabras):** feature = unidad de trabajo; tarjeta = su registro en una sesión; spec = su registro si dura más; ADR = decisión irreversible; guía = procedimiento; changelog = historial.

**Verde** = el guardarraíl pasa (topes, contratos, probes) y los smokes de ruteo responden; no dice si tu producto es correcto.
**Tras cambiar skills o config:** `.\sync-global.ps1` y reinicia OpenCode (la config no es hot-reload); `.\scripts\verify.ps1` comprueba todo.

**Regla:** la documentación del harness vive en `docs/harness/`, nunca dentro de `.opencode/`
(runtime: agentes, skills y commands). Excepción aceptada: cada skill puede llevar su propio
README de contexto (viaja con la skill al sincronizar a otros proyectos). El guardarraíl lo
verifica: bloquea `.opencode/Logs/` y exige `estado-actual.md` (check 8 de `harness-budget.ps1`).
