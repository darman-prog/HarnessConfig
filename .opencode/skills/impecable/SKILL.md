---
name: impecable
description: Skill Impeccable (diseno) para UI: polish, critique, audit, detect, DESIGN.md, PRODUCT.md, anti AI-slop. Usar al crear, revisar o pulir interfaces frontend, o cuando el usuario mencione impeccable/impecable, slop de diseno o calidad visual. No usar en backend puro.
---

# Impeccable (wrapper para OpenCode)

Wrapper propio sobre el CLI oficial (`npx impeccable`). Contexto: OpenCode no recibe hook
automatico post-edicion (solo Claude Code, Cursor, Copilot, Codex, Grok), por eso este
wrapper obliga al detector manual y integra los comandos en el flujo del proyecto.

> **Relacion con `impeccable`**: esta skill define el **flujo** del proyecto (cuando correr
> cada comando y en que orden). La skill `impeccable` (oficial, con `reference/`) define
> **como ejecutar** el diseno de cada comando. En tareas de UI cargalas juntas: `impecable`
> para el flujo, `impeccable` para la ejecucion.

## Reglas no negociables

1. **Detector manual obligatorio**: OpenCode no tiene hook auto. Antes de dar por terminado
   cualquier cambio de UI, correr `npx impeccable detect` sobre los archivos tocados.
   Exit `0` = limpio; exit `2` = hallazgos, NO terminar sin resolverlos o dejarlos justificados.
2. **Contexto primero**: si el proyecto no tiene `PRODUCT.md` y `DESIGN.md`, proponer
   `/impeccable init` antes de cualquier comando de diseno. Sin contexto, los comandos caen
   en patrones genericos de SaaS.
3. **polish solo sobre features terminadas** (sin TODOs). Si el pase reestructura layout,
   el comando correcto era `critique` o `layout`.

## Enrutamiento (usar el par correcto, nunca uno solo)

- `audit` -> `harden` / `polish` / `optimize` (segun hallazgos P0-P3).
- `critique` -> `polish` / `distill` (segun veredicto).
- `bolder` <-> `quieter` (par de "volumen"; decidir rumbo, no quedar neutro).
- `init` -> `shape` (capturar producto, luego planear la superficie).

## Comandos (23, via `/impeccable <comando> [objetivo]`)

- Crear: `impeccable` (sin args = siguiente mejor accion; con texto = creacion directa), `shape` (brief antes de construir).
- Evaluar: `audit` (tecnico, 5 dimensiones, P0-P3), `critique` (perceptual + detector).
- Refinar: `animate`, `bolder`, `colorize`, `delight`, `layout`, `overdrive`, `quieter`, `typeset`.
- Simplificar: `adapt`, `clarify`, `distill`.
- Endurecer: `harden`, `onboard`, `optimize`, `polish`.
- Sistema: `document` (genera DESIGN.md), `extract`, `init`, `live` (alpha, app en localhost).

## Detector, excepciones y mantenimiento

Sintaxis exacta de `detect`, `ignores`, config y mantenimiento del CLI: `references/CLI.md`.

## Integracion con este repo

- Convive con `convenciones-frontend` (estructura/features/WCAG) y con el checklist anti-patrones
  de `ui-ux`: Impeccable cubre lo perceptual y los anti-patrones de AI-slop, no reemplaza esas reglas.
- Mantenimiento (`check`, `update`, `doctor`) y atajos (`pin`): `references/CLI.md`.
