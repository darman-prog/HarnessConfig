---
name: contexto-proyecto
description: Organiza y recupera el contexto del proyecto desde docs/project-brain/ (cerebro documental). Cargar INDEX.md primero y solo los documentos relevantes segun la tarea; detecta contradicciones entre codigo y documentacion; actualiza documentos afectados tras cambios verificados. Usar en toda tarea si el proyecto tiene project-brain, al crear uno nuevo, o cuando el usuario mencione contexto, cerebro o project-brain. No reemplaza AGENTS.md (arranque) ni documentacion (estilo de escritura).
---

# Contexto de proyecto (cerebro documental)

Memoria organizada del proyecto en documentos pequenos y cargables bajo demanda.
`AGENTS.md` es el sistema de arranque; `docs/project-brain/` es la memoria.

## Estructura canonica

```text
docs/project-brain/
├── INDEX.md          # indice maestro: que contiene cada doc, cuando cargarlo, estado
├── PRODUCT.md        # problema, usuarios, propuesta de valor, MVP
├── DESIGN.md         # direccion visual, tokens, estados, accesibilidad
├── ARCHITECTURE.md   # capas, limites, patrones, decisiones estructurales
├── DOMAIN.md         # reglas de negocio, entidades, invariantes, vocabulario
├── API.md            # endpoints, contratos, errores, versionado
├── DATA.md           # esquema, entidades de persistencia, migraciones, indices
├── SECURITY.md       # auth, permisos, datos sensibles, controles
├── TESTING.md        # estrategia, suites, cobertura, comandos
├── OPERATIONS.md     # despliegue, ambientes, backups, runbooks
├── DECISIONS/        # ADRs: NNN-titulo-corto.md
└── FLOWS/            # flujos de usuario: login.md, checkout.md, etc.
```

No todos los documentos existen en todo proyecto: crea solo los que tengan contenido
real. `INDEX.md` es obligatorio y siempre existe.

## Protocolo de lectura (toda tarea)

1. Lee `docs/project-brain/INDEX.md` (30-60 lineas, siempre).
2. Según la tarea, carga SOLO los documentos relevantes:
   - Tarea UI → `DESIGN.md` + `FLOWS/` relacionados.
   - Endpoint/contrato → `API.md` + `DOMAIN.md`.
   - Esquema/migracion → `DATA.md` + `DOMAIN.md`.
   - Auth/permisos → `SECURITY.md` + `API.md`.
   - Arquitectura/limites → `ARCHITECTURE.md` + ADRs relacionados.
   - Bug en flujo → `FLOWS/` del flujo + documento del dominio afectado.
3. Nunca cargues el cerebro completo de golpe.
4. Si `INDEX.md` no existe pero el proyecto tiene codigo, propon crearlo (seccion
   "Siembra del cerebro" abajo) antes de seguir.

## Metadata de cada documento

Cada doc del cerebro abre con frontmatter minimo:

```markdown
---
status: vigente        # vigente | pendiente | obsoleto | en_revision
last_reviewed: 2026-09-18
confidence: confirmado # confirmado | supuesto | inferido
source: entrevista inicial  # o: codigo, decision de usuario, ADR-003
---
```

Reglas de interpretacion:

- `confidence: supuesto` o `inferido` NO es una regla definitiva; verificalo contra
  codigo antes de actuar sobre el.
- `status: obsoleto` no se usa como fuente; propon actualizarlo.
- `status: pendiente` con decision abierta → lista la decision, no inventes el dato.

## Deteccion de contradicciones (codigo vs documentacion)

Si el codigo contradice un documento del cerebro:

1. Identifica el punto exacto: `documento:linea` vs `codigo:linea`.
2. Determina fuente de verdad: codigo verificado gana sobre doc `supuesto`; doc
   `confirmado` con ADR gana sobre codigo reciente sin decision (posible regresion).
3. Reporta la contradiccion:

```markdown
## Contradiccion detectada
- Documento: `API.md:24` (confirmado)
- Codigo: `src/routes/accounts.ts:18`
- Diferencia: doc dice POST /api/users; endpoint real es POST /api/accounts
- Impacto: alto
- Accion: ¿actualizar API.md o corregir codigo? Requiere decision.
```

4. **Nunca corrijas codigo automaticamente** porque contradice la documentacion.
   La fuente de verdad la decide el usuario o el ADR, no la antiguedad del doc.

## Actualizacion del cerebro (tras cambios verificados)

Momento: al cerrar una unidad verificable (paso de plan verificado, feature cerrada,
bugfix con regresion), NO despues de cada edicion de linea.

Flujo:

```text
Cambio de codigo → tests/validacion → calidad-cierre
→ detectar documentos afectados → actualizar SOLO esos → registrar fecha y fuente
```

Mapeo de cambios:

| Cambio | Documentos a actualizar |
| --- | --- |
| Endpoint nuevo/modificado/eliminado | `API.md` |
| Migracion, tabla, indice | `DATA.md` |
| Regla de negocio | `DOMAIN.md` (+ ADR si no es trivial) |
| Limite de capas, patron estructural | `ARCHITECTURE.md` + ADR nuevo |
| Auth, permisos, datos sensibles | `SECURITY.md` |
| Flujo visual/UX | `DESIGN.md` o `FLOWS/<flujo>.md` |
| Decision de arquitectura | ADR nuevo en `DECISIONS/` + doc afectado |
| Estrategia o suite de tests | `TESTING.md` |
| Deploy, ambientes, runbook | `OPERATIONS.md` |

Reglas de actualizacion:

- Actualiza solo documentos afectados; nunca todo el cerebro "de paso".
- Nunca inventes decisiones: si la evidencia no basta, marca `confidence: supuesto`
  y `status: pendiente` con la pregunta abierta.
- Actualiza `last_reviewed` y `source` de los documentos tocados.
- Actualiza `INDEX.md` si cambia el estado o la relevancia de un documento.
- No crees documentacion si el cambio no altera conocimiento reutilizable.
- Muestra al usuario un resumen de que documentos actualizaste antes de cerrar.

## Siembra del cerebro (proyecto sin project-brain)

Si el proyecto no tiene `docs/project-brain/`:

1. Proponesembrar la estructura minima: `INDEX.md` + los 2-4 documentos con contenido
   real verificable desde el codigo (tipicamente `ARCHITECTURE.md`, `API.md`, `DATA.md`).
2. NO rellenes documentos con supuestos: cada dato lleva `confidence` acorde a su
   evidencia.
3. Para contenido de producto (problema, usuarios, MVP) usa el modo jurado de
   preguntas de `inicio-proyecto`; no lo inventes.
4. `PRODUCT.md` y `DESIGN.md` pueden vivir en la raiz (compatibilidad con las skills
   de diseno) y `INDEX.md` los enlaza; o dentro del cerebro si el proyecto prefiere.
   Elige una ubicacion y registrala en `INDEX.md`.

## Relacion con otras skills

- `inicio-proyecto`: crea la estructura inicial del cerebro durante el onboarding.
- `documentacion`: define estilo de escritura, ADRs y ubicaciones de docs.
- `calidad-cierre`: verifica que el cambio no contradiga el cerebro antes de cerrar.
- `arquitectura`: el contenido de `ARCHITECTURE.md` sigue sus convenciones.

Consulta [INDEX-TEMPLATE.md](references/INDEX-TEMPLATE.md) para el formato del indice
y [UPDATE-RULES.md](references/UPDATE-RULES.md) para casos detallados de actualizacion.
