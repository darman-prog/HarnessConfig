# Feature-spec (DDR): una por feature

Fuente de verdad de un cambio auditable mientras está abierto: se planea, se ejecuta y se cierra desde aquí.
Se persiste en `docs/features/NNN-<slug>.md`; la cola de trabajo vive en `BACKLOG.md`.

## Cuándo se usa

- **Expediente (esta spec)**: más de un commit, toca comportamiento visible, esquema, contrato o configuración, o lo pide la persona.
- **Tarjeta**: una sesión, cambio pequeño con efecto observable ([FEATURE-CARD.md](FEATURE-CARD.md)).
- **Micro-fix**: un commit sin efecto observable; solo changelog.

Este es el umbral canónico; el resto de archivos apunta aquí.

## Plantilla y ciclo

Plantilla cruda (la consume `trace.py start`): [templates/SPEC.md](templates/SPEC.md). Tope: 60 líneas.

Estados: `borrador` → `aprobada` → `en-curso` → `bloqueada` (con la duda escrita) → `cerrada`.

- `plan` redacta el contenido; `build` la persiste con `trace.py start` al arrancar.
- Mientras no esté `cerrada`, manda sobre el plan y el changelog.
- Al cerrar: `calidad-cierre` verifica criterio a criterio contra la bitácora; el changelog recibe la fila resumen.
- Una spec `cerrada` no se reescribe: una decisión nueva abre otra feature o un ADR.

## Reglas

- Un criterio sin `Comando` no se puede verificar: `record` lo rechaza.
- La bitácora se escribe al ejecutar, no al final: hechos, no relatos.
- `Rollback` es obligatorio: comando o pasos exactos para deshacer.
- Objetivo y Contexto en lenguaje llano; el detalle técnico va en Pasos y Bitácora.
