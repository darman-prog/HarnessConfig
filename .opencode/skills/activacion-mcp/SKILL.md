---
name: activacion-mcp
description: Guía la activación y uso de perfiles MCP opt-in del proyecto, como Notion, Playwright y Stitch. Usar cuando una tarea necesite una herramienta MCP.
---

# Activación de perfiles MCP

Playwright y Notion son opt-in por proyecto; Stitch está declarado en la config global pero deshabilitado. Se activa solo cuando el usuario lo pide, con un perfil de sesión. Nunca asumas que una herramienta está disponible.

| Perfil | Herramienta | Archivo |
| --- | --- | --- |
| QA | Playwright | `.opencode/opencode.qa.json` |
| Notion | Notion | `.opencode/opencode.notion.json` |
| Stitch | Google Stitch | global, deshabilitado por defecto |

- Comprueba que el perfil exista en el proyecto y que la tarea realmente necesite ese MCP.
- En PowerShell, se inicia OpenCode con el perfil elegido: `$env:OPENCODE_CONFIG = ".opencode/opencode.notion.json"; opencode` (para QA, usa `opencode.qa.json`). Reinicia la sesión con un único perfil opt-in.
- Si OpenCode ya está corriendo sin ese MCP, no finjas que está disponible: indica el perfil que debe activar el usuario y espera a que lo reinicie.
- No habilites MCP globalmente ni por tu cuenta (Stitch incluido), no copies perfiles a otros proyectos y no cambies OAuth, permisos o configuración sin autorización explícita.
- Para sincronizar tareas con Notion, carga las reglas operativas de [notion.md](../../../docs/harness/notion.md) después de confirmar que el MCP está activo.
- Playwright se usa solo para QA solicitado; sigue las restricciones y permisos del proyecto.
- Stitch está deshabilitado por defecto. Para activarlo, el usuario debe relanzar con `$env:OPENCODE_CONFIG = "$env:USERPROFILE\.config\opencode\opencode.stitch.json"; opencode`; el agente no lo activa solo.
- Stitch requiere `STITCH_API_KEY` en el entorno (permanente para toda la máquina). Sin ella el header llega vacío y el MCP falla. No commitees la key ni la pegues en el chat.
- Montaje, smoke y troubleshooting de Stitch: [stitch.md](../../../docs/harness/stitch.md).
