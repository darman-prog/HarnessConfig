---
name: notion-flow
description: Sincroniza planes y tareas con Notion: al crear plan genera Fases+Tareas, al commitear paso mueve tarea a Done con link. Usar al mencionar Notion, plan, fase, tarea o sincronizar. Requiere perfil notion activo (opencode.notion.json).
---

# Notion Flow

Sincroniza el flujo de trabajo de OpenCode con Notion. Git es la fuente de verdad; Notion solo refleja el estado. Nunca reconstruyas estado desde Notion.

## Requisitos

- Perfil notion activo: `$env:OPENCODE_CONFIG="...opencode.notion.json"; opencode`
- Integracion OAuth configurada en Notion con acceso limitado a las bases de datos del portafolio.
- API 2025-09-03 usa `data_source_id` (no `database_id`) en queries.

## Plantilla de bases de datos (crear una vez en Notion)

**Proyectos**: nombre, estado (Activo/Pausado/Completado), ruta repo, stack.
**Fases**: relacion a Proyecto, orden, estado (Plan/En progreso/Hecho).
**Tareas**: relacion a Fase, estado (Todo/Doing/Done), tipo (feat/fix/refactor/test/docs/chore), link commit, evidencia.

Vistas: Kanban por estado y tablero por proyecto. Pagina maestra "Portafolio" con template duplicable.

## Reglas de sincronizacion automatica

1. **Al entregar plan numerado** (agente `plan` o `build` ejecutando plan):
   - Crear pagina Fase vinculada al Proyecto en Notion.
   - Por cada paso del plan, crear Tarea con estado Todo, tipo segun la accion (feat/fix/...).
   - Responder con IDs de las paginas creadas para trazabilidad.

2. **Al proponer commit de paso** (skill `workflow`, seccion "Commits por paso de plan"):
   - Antes de commitear, mover la Tarea correspondiente a Doing.
   - Tras el commit aprobado, mover a Done y escribir el link del commit en la propiedad "link commit".

3. **Al cerrar feature** (DoD completa, PR mergeado o feature terminada):
   - Actualizar estado del Proyecto a "Completado" si todas las Fases estan Hecho.
   - Dejar evidencia en la pagina del Proyecto (resumen, links a commits clave).

4. **Consultas manuales**: el usuario puede pedir "muestrame tareas pendientes del proyecto X" o "resume avance de la Fase 2" — el agente querya Notion y responde.

## Comandos utiles (via MCP)

- `search` — buscar paginas/bases por nombre.
- `query-data-source` — listar tareas de una base con filtros.
- `create-page` — crear tarea/fase/proyecto.
- `update-page` — mover tarea a Done, actualizar estado.
- `retrieve-page` — leer detalles de una pagina.

## Restricciones

- Solo se carga cuando el perfil notion esta activo (MCP disponible).
- No escribe en Notion sin que el agente haya terminado la accion en git (commit, merge, etc.).
- Si el MCP falla o no esta disponible, el agente continua sin sincronizar y avisa en 1 linea.
