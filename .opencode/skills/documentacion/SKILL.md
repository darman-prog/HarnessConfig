---
name: documentacion
description: READMEs, ADRs, guías y feature-spec auditable en docs/ (spec o tarjeta). No cubre JSDoc.
---

# Documentacion
- No usar cuando: pides actualizar el indice o el estado del proyecto (eso es `contexto-proyecto`).

## Cerebro documental (project-brain)

Si el proyecto tiene `docs/project-brain/`, la organizacion y actualizacion del
contexto la gestiona la skill `contexto-proyecto` (indice, carga por tarea, metadata
de confianza, deteccion de contradicciones). Esta skill define el estilo de escritura
y los formatos; `contexto-proyecto` define lo que se actualiza y cuando. No dupliques:
un documento del cerebro sigue ambas (formato de esta, ciclo de vida de aquella).

## Que se documenta y donde

- `README.md` (raiz o por paquete): como levantar, comandos clave y estructura basica. Apunta a `AGENTS.md` (contexto) y `OPENCODE.md` (Skill Gate y estilo) para convenciones de agentes, no las duplica.
- `docs/adr/NNN-<titulo-corto>.md`: toda decisión **irreversible o global** (stack, contrato/API, permisos, modelo de datos, dependencia de máquina). Numeración secuencial, sin renumerar. No es un ADR: un procedimiento paso a paso va a `docs/guias/`.
- `docs/guias/`: procedimientos paso a paso (onboarding, setup de infra, debug) y **guias tecnicas, tutoriales o talleres**: una peticion de guia es documentacion aqui, nunca un plan de implementacion.
- `docs/features/`: cola en `BACKLOG.md`; **spec** para cambios auditables (≤60 líneas, bitácora por criterio) y **tarjeta** para los pequeños (≤25). Contrato y CLI: [TRACE.md](references/TRACE.md); plantillas: [SPEC](references/templates/SPEC.md), [CARD](references/templates/CARD.md); reglas y ciclo: [FEATURE-SPEC.md](references/FEATURE-SPEC.md), [FEATURE-CARD.md](references/FEATURE-CARD.md).
- El trabajo abierto se registra con `trace.py`; al cerrar, la fila del backlog se borra y el registro conserva `tarea: B-NNN`.
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

- Doc que contradice el codigo se corrige o elimina en el mismo cambio que la introduce: la documentacion obsoleta es un bug.
- Todo doc nuevo o editado se revisa: Titulo claro, fecha/estado si es ADR, sin secciones vacias.
- Antes de terminar, verificar que README, `OPENCODE.md` y `AGENTS.md` reflejan el stack y comandos vigentes; si cambiaron, proponer actualizarlos (no editar `OPENCODE.md` silenciosamente).

## Que NO es documentacion de esta skill

- Comentarios dentro del codigo: solo explican el "por que" no evidente, nunca el "que".
- Mensajes de commit: skill `workflow`.
- Contratos de API documentados en codigo/types: skill `api-backend`.
