# Operativa del cerebro documental

Detalle de metadata, contradicciones, actualizacion y siembra. La skill `contexto-proyecto`
mantiene los gatillos y el protocolo de lectura; aqui vive el "como".

## Metadata de cada documento

```markdown
---
status: vigente        # vigente | pendiente | obsoleto | en_revision
last_reviewed: 2026-09-18
confidence: confirmado # confirmado | supuesto | inferido
source: entrevista inicial  # o: codigo, decision de usuario, ADR-003
---
```

Reglas de interpretacion:

- `confidence: supuesto` o `inferido` NO es regla definitiva: verificalo contra codigo antes de actuar.
- `status: obsoleto` no se usa como fuente; propon actualizarlo.
- `status: pendiente` con decision abierta → lista la decision, no inventes el dato.

## Deteccion de contradicciones (codigo vs documentacion)

Si el codigo contradice un documento del cerebro:

1. Identifica el punto exacto: `documento:linea` vs `codigo:linea`.
2. Determina fuente de verdad: codigo verificado gana sobre doc `supuesto`; doc `confirmado`
   con ADR gana sobre codigo reciente sin decision (posible regresion).
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

1. Propon sembrar la estructura minima: `INDEX.md` + los 2-4 documentos con contenido
   real verificable desde el codigo (tipicamente `ARCHITECTURE.md`, `API.md`, `DATA.md`).
2. NO rellenes documentos con supuestos: cada dato lleva `confidence` acorde a su evidencia.
3. Para contenido de producto (problema, usuarios, MVP) usa el modo jurado de preguntas
   de `inicio-proyecto`; no lo inventes.
4. `PRODUCT.md` y `DESIGN.md` pueden vivir en la raiz (compatibilidad con las skills de
   diseno) y `INDEX.md` los enlaza; o dentro del cerebro si el proyecto prefiere.
   Elige una ubicacion y registrala en `INDEX.md`.
