# Documentacion del repositorio

> **Para quién:** dev junior con TDAH — índice corto; leer en 1 min.
> **Para qué:** saber dónde está cada cosa sin bucear el repo.

| Carpeta | Qué hay | Cuándo la necesitas |
| --- | --- | --- |
| [harness/](harness/) | [estado-actual.md](harness/estado-actual.md) (qué existe hoy y cómo se mueve una tarea) · [pipeline.md](harness/pipeline.md) (el paso a paso operativo) · [changelog.md](harness/changelog.md) (una entrada por cambio, append-only) · [auditoria-v2.md](harness/auditoria-v2.md) (histórica) | Cambiaste agentes, skills, permisos o el presupuesto del harness |
| [specs/](specs/) | Specs de features del harness: `001` (ahorro de tokens) y `002` (adopción del review de UI) | Quieres el criterio, la evidencia y el cierre de un cambio grande |

**Regla:** la documentación del harness vive en `docs/harness/`, nunca dentro de `.opencode/`
(que es la carpeta de runtime: agentes, skills y commands). El guardarraíl lo verifica.
