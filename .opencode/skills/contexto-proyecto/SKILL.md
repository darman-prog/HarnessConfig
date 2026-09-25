---
name: contexto-proyecto
description: Organiza y recupera el contexto del proyecto desde docs/project-brain/. Usar SOLO si la tarea toca docs/project-brain/ o el usuario menciona contexto, cerebro o project-brain. No reemplaza AGENTS.md ni `documentacion`.
---

# Contexto de proyecto (cerebro documental)

Memoria del proyecto en documentos pequenos cargables bajo demanda.
`AGENTS.md` es el sistema de arranque; `docs/project-brain/` es la memoria.

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
- La intencion de un cambio de mas de una sesion vive en su entrada del changelog; las decisiones de arquitectura, en `docs/adr/`. Un dato vive en un solo lugar.

Formatos: [INDEX-TEMPLATE.md](references/INDEX-TEMPLATE.md) · [UPDATE-RULES.md](references/UPDATE-RULES.md) · [OPERATIVA.md](references/OPERATIVA.md)
