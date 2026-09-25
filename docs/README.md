# Documentacion del repositorio

> **Para quién:** dev junior con TDAH — índice corto; leer en 1 min.
> **Para qué:** saber dónde está cada cosa sin bucear el repo.

| Carpeta | Qué hay | Cuándo la necesitas |
| --- | --- | --- |
| [harness/](harness/) | [estado-actual.md](harness/estado-actual.md) (qué existe hoy y cómo se mueve una tarea) · [pipeline.md](harness/pipeline.md) (el paso a paso operativo) · [changelog.md](harness/changelog.md) (una entrada por cambio, append-only) · [presupuestos.md](harness/presupuestos.md) (los topes y su porqué) · [auditoria-v2.md](harness/auditoria-v2.md) (histórica) | Cambiaste agentes, skills, permisos o el presupuesto del harness |
| [project-brain/](project-brain/) | Cerebro documental: [INDEX.md](project-brain/INDEX.md) (el índice que se carga siempre) · [ARCHITECTURE.md](project-brain/ARCHITECTURE.md) (capas e invariantes) | Estás con dudas de "qué hay, dónde vive o qué no se rompe" |
| [specs/](specs/) | Archivo histórico: `001` (ahorro de tokens), `002` (review de UI) y `003` (retirada de sdd-lite). El sistema de specs ya no genera planes | Quieres el criterio, la evidencia y el cierre de un cambio grande ya pasado |

**Regla:** la documentación del harness vive en `docs/harness/`, nunca dentro de `.opencode/`
(que es la carpeta de runtime: agentes, skills y commands). El guardarraíl lo verifica.
