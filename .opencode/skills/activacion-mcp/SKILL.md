---
name: activacion-mcp
description: Guía la activación y uso de perfiles MCP opt-in del proyecto, como Notion y Playwright. Usar cuando una tarea necesite una herramienta MCP.
---

# Activación de perfiles MCP

Los perfiles MCP son opt-in por proyecto; no se activan por editar la configuración global ni por asumir que una herramienta está disponible.

| Perfil | Herramienta | Archivo |
| --- | --- | --- |
| QA | Playwright | `.opencode/opencode.qa.json` |
| Notion | Notion | `.opencode/opencode.notion.json` |

- Comprueba que el perfil exista en el proyecto y que la tarea realmente necesite ese MCP.
- En PowerShell, se inicia OpenCode con el perfil elegido: `$env:OPENCODE_CONFIG = ".opencode/opencode.notion.json"; opencode` (para QA, usa `opencode.qa.json`). Reinicia la sesión con un único perfil opt-in.
- Si OpenCode ya está corriendo sin ese MCP, no finjas que está disponible: indica el perfil que debe activar el usuario y espera a que lo reinicie.
- No habilites MCP globalmente, no copies perfiles a otros proyectos y no cambies OAuth, permisos o configuración sin autorización explícita.
- Para sincronizar tareas con Notion, carga las reglas operativas de [notion.md](../../../docs/harness/notion.md) después de confirmar que el MCP está activo.
- Playwright se usa solo para QA solicitado; sigue las restricciones y permisos del proyecto.
