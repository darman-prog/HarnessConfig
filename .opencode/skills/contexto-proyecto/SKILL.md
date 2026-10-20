---
name: contexto-proyecto
description: Lee docs/project-brain/ (cerebro) antes de preguntar por el estado del proyecto.
---

# Contexto de proyecto (cerebro documental)
- No usar cuando: pides escribir un README, un ADR o una guia (eso es `documentacion`).

Memoria del proyecto en documentos pequenos cargables bajo demanda.
`OPENCODE.md` (Skill Gate y estilo) + `AGENTS.md` (contexto agnóstico) son el sistema de arranque; `docs/project-brain/` es la memoria.

## Estructura canonica

```text
docs/project-brain/
├── INDEX.md          # obligatorio: que contiene cada doc, cuando cargarlo, estado
├── PRODUCT.md  DESIGN.md  ARCHITECTURE.md  DOMAIN.md
├── API.md  DATA.md  SECURITY.md  TESTING.md  OPERATIONS.md
└── DECISIONS/ (ADRs NNN-titulo.md)   FLOWS/ (login.md, checkout.md, ...)
```

Crea solo los documentos con contenido real; `INDEX.md` siempre existe.

## Protocolo de lectura

1. Lee `docs/project-brain/INDEX.md` (30-60 lineas, siempre).
2. Carga SOLO lo relevante: UI → `DESIGN.md`+`FLOWS/`; endpoint → `API.md`+`DOMAIN.md`;
   esquema → `DATA.md`+`DOMAIN.md`; auth → `SECURITY.md`+`API.md`; arquitectura →
   `ARCHITECTURE.md`+ADRs; bug de flujo → `FLOWS/`+documento del dominio afectado.
3. Nunca cargues el cerebro completo de golpe.
4. Si no existe `INDEX.md` pero hay codigo, propon sembrarlo antes de seguir.

## Metadata y confianza

Cada documento abre con `status` (vigente|pendiente|obsoleto|en_revision), `last_reviewed`,
`confidence` (confirmado|supuesto|inferido) y `source`. `supuesto`/`inferido` no es regla
definitiva: verificalo contra codigo. `obsoleto` no se usa como fuente.

## Actualizacion

Al cerrar una unidad verificable (no en cada edicion), actualiza SOLO los documentos
afectados, con fecha y fuente; nunca "todo el cerebro de paso". Mapeo cambio→documento,
contradicciones codigo vs documentacion y siembra: ver `references/OPERATIVA.md`.

## Relacion con otras skills

- `inicio-proyecto`: crea la estructura inicial del cerebro durante el onboarding.
- `documentacion`: estilo de escritura, ADRs y ubicaciones de docs.
- `calidad-cierre`: verifica que el cambio no contradiga el cerebro antes de cerrar.
- `arquitectura`: convenciones del contenido de `ARCHITECTURE.md`.
- La intencion de un cambio multi-sesion vive en la feature-spec de `docs/features/NNN-*.md` (umbral canonico: `documentacion` §docs/features); al cerrar, propagar al cerebro y dejar la fila resumen en el changelog; las decisiones de arquitectura, en `docs/adr/`. Un dato vive en un solo lugar.

Formatos: [INDEX-TEMPLATE.md](references/INDEX-TEMPLATE.md) · [UPDATE-RULES.md](references/UPDATE-RULES.md) · [OPERATIVA.md](references/OPERATIVA.md)
