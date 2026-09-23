---
name: documentacion
description: Documentacion: READMEs, ADRs, specs y guias en docs/. Usar al crear, actualizar, estructurar o auditar documentacion, al decidir con ADR o cuando el usuario pida documentar. No cubre JSDoc.
---

# Documentacion

## Cerebro documental (project-brain)

Si el proyecto tiene `docs/project-brain/`, la organizacion y actualizacion del
contexto la gestiona la skill `contexto-proyecto` (indice, carga por tarea, metadata
de confianza, deteccion de contradicciones). Esta skill define el estilo de escritura
y los formatos; `contexto-proyecto` define que se actualiza y cuando. No dupliques:
un documento del cerebro sigue ambas (formato de esta, ciclo de vida de aquella).

## Que se documenta y donde

- `README.md` (raiz o por paquete): como levantar, comandos clave y estructura basica. Apunta a `AGENTS.md` para convenciones de agentes, no las duplica.
- `docs/adr/NNN-<titulo-corto>.md`: toda decision de arquitectura no trivial (cambio de stack, contrato, patron, infraestructura relevante). Numeracion secuencial, sin renumerar.
- `docs/specs/`: specs de features — la intención del plan técnico persistida. Naming `NNN-<slug>.md`, ciclo de vida `borrador → aprobada → implementada → obsoleta`; sin índice propio: listar con glob `docs/specs/*.md`; specs `obsoleta` no se cargan salvo trazabilidad. Umbral canónico y topes: ver `PLAN-TECNICO.md` (skill `ingenieria-software`; sin duplicar cifras ni criterios).
- `docs/guias/`: procedimientos paso a paso (onboarding, setup de infra, debug).
- Decision implicita en codigo simple no requiere doc; no documentes por documentar.

## Estilo

- Espanol claro, frases cortas, orientado a un dev junior que llega al repo por primera vez.
- Cada doc abre con 2-3 lineas: para que sirve y cuando leerla.
- Ejemplos con bloques de codigo reales del repo, no pseudocodigo si el real existe.
- Referencias cruzadas por ruta relativa, nunca copiar contenido de otra doc (una sola fuente de verdad; enlaza con `[skill](ruta)`).
- Sin doc leaking: la documentacion no contiene secretos, URLs internas de produccion ni datos de usuarios.

## ADR (Architecture Decision Record)

Formato minimo por ADR:

```markdown
# ADR NNN: <titulo>
## Contexto
Problema y fuerzas en juego.
## Decision
Que se decidio.
## Consecuencias
Positivas, negativas y mitigaciones.
## Alternativas descartadas
Una linea por alternativa y por que no.
```

- Un ADR se crea cuando se toma la decision, no despues; si llega tarde, igual documenta el estado real del codigo.
- Un ADR no se edita para cambiar la decision: se crea uno nuevo que la reemplace y el viejo se marca como reemplazado (link al nuevo).

## Mantenimiento

- Doc que contradice el codigo se corrige o elimina en el mismo cambio que la introduce (regla de `AGENTS.md`: documentacion obsoleta es bug).
- Todo doc nuevo o editado se revisa: Titulo claro, fecha/estado si es ADR, sin secciones vacias.
- Antes de terminar, verificar que README/AGENTS.md reflejan el stack y comandos vigentes; si cambiaron, proponer actualizarlos (no editar AGENTS.md silenciosamente).

## Que NO es documentacion de esta skill

- Comentarios dentro del codigo: solo explican el "por que" no evidente, nunca el "que".
- Mensajes de commit: skill `workflow`.
- Contratos de API documentados en codigo/types: skill `contratos-api`.
