---
name: inicio-proyecto
description: Inicia o reaprovecha un proyecto con las skills, agentes y config del harness. Preguntas progresivas de stack, BD, UI y producto; genera PRODUCT.md, DESIGN.md y AGENTS.md mergeado; copia .opencode/ y opencode.json del template excluyendo node_modules. Usar al empezar un proyecto nuevo o existente que quiera adoptar la config del harness. No usa /init; no reemplaza skills de dominio (las complementa).
---

# Inicio de proyecto

Skill de onboarding. Pregunta, copia config del harness, genera docs base y deja el proyecto listo para trabajar. No ejecuta `/init`.

## Flujo

1. **Preguntas progresivas** (5-7 por turno, no un monologo). Bloques:
   - Bloque A: nombre del proyecto, descripcion breve, tipo (web/app/api/cli), publico objetivo.
   - Bloque B: stack frontend (Angular/React/Vue/Svelte/ninguno), stack backend (Django/Spring/Laravel/NestJS/.NET/ninguno), lenguaje principal.
   - Bloque C: base de datos (PostgreSQL/MySQL/MongoDB/SQLite/otra), ORM si aplica, testing framework preferido.
   - Bloque D: estilo visual (minimalista/colorido/corporativo/gaming), componentes UI preferidos, necesidades de accesibilidad, animaciones.
   - Bloque E: alcance inicial (MVP/hackathon/produccion), prioridades (velocidad/calidad/ambas), tiene Figma/wireframes, tiene API externa.
2. **Copiar config del proyecto** (comandos exactos en `references/AGENTS-MERGE.md`):
   - Las skills y agentes del harness ya estan **globales** (via `sync-global.ps1` de la plantilla); NO se copian `.opencode/skills/` ni `.opencode/agents/` al proyecto.
   - `Copy-Item` de `opencode.json` template → `.opencode/opencode.json` del proyecto (permisos, compaction, instructions).
   - Perfiles MCP opt-in: si el usuario quiere QA (Playwright) o Notion, copia `opencode.qa.json` / `opencode.notion.json` del template a `.opencode/`; si no, no los copies.
3. **Generar docs**:
   - `PRODUCT.md` y `DESIGN.md` desde templates en `references/` con las respuestas.
   - `AGENTS.md`: merge por secciones (Stack/Comandos se actualizan con lo descubierto; resto se preserva). Si no existe, copia el template y aplica el merge.
   - `docs/project-brain/`: siembra el cerebro documental con `INDEX.md` (template de la skill `contexto-proyecto`) + los 2-4 documentos con contenido real desde las respuestas (tipicamente `PRODUCT.md` de detalle, `ARCHITECTURE.md` inicial con `confidence: supuesto`, `DATA.md` si ya hay esquema). Datos sin evidencia llevan `confidence: supuesto`.
4. **Cierre**: resume que se creo, que archivos quedaron pendientes de ajustar y que NO corre `/init`.

## Reglas

- Pregunta en bloques chicos; no des 20 preguntas seguidas.
- Skills y agentes ya son globales: si el proyecto destino los necesita y no los tiene, apunta al comando `.\sync-global.ps1` de la plantilla; no copies skills al proyecto.
- No crees sub-agentes nuevos; usa los existentes del harness.
- No modifiques `impecable/SKILL.md` ni `impeccable/SKILL.md`.
- No corras `/init`; el merge de AGENTS.md lo reemplaza.
- No copies `node_modules` ni `.git` del template.
- El contenido del cerebro sigue las reglas de la skill `contexto-proyecto` (metadata
  de confianza, actualizacion solo tras cambio verificado).

Lee [PRODUCT-TEMPLATE.md](references/PRODUCT-TEMPLATE.md) y [DESIGN-TEMPLATE.md](references/DESIGN-TEMPLATE.md) para los templates de docs. Lee [AGENTS-MERGE.md](references/AGENTS-MERGE.md) para el comando de copia y la logica de merge. Para el formato del `INDEX.md` del cerebro, usa el template de la skill `contexto-proyecto`.
