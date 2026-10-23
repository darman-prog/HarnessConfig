# AGENTS.md

Archivo de contexto agnóstico del repo: válido para cualquier agente (humano o IA).
OpenCode suma `OPENCODE.md` (Skill Gate, estilo de respuesta y agentes).

## Stack
Ver `.opencode/` para skills y config. Si esta seccion sigue vacia al iniciar un proyecto, el agente debe preguntar el stack al usuario (flujo en skill `uso-eficiente`, seccion "Onboarding de stack") y luego proponer `/init`.

## Comandos
- `opencode` (TUI) · `/init` (regenerar este archivo si cambia el stack) · `.\sync-global.ps1` (sincronizar skills/agentes/commands al harness global; reiniciar TUI despues) · `.\scripts\new-feature.ps1` (wrapper de `trace.py`)
- Trazabilidad: `python` 3.8+ y `trace.py` de la skill `documentacion` (`init`, `task`, `start`, `record`, `close`, `drop`, `check`, `adopt`).

## Contexto
Ante la duda: lee este archivo y `docs/project-brain/NAVIGATION.md` (si existe) antes de preguntar o asumir.
Fuera del repo: no explores rutas externas salvo que la tarea nombre la ruta o el repo no responda.
`grep`/`glob` antes que `read`; no re-leas archivos ya vistos: este archivo es cache.

## Manejo de `.gitignore`
Puedes crear `.gitignore` (raiz o subdirectorios) y agregar entradas. **Nunca elimines ni sobrescribas las existentes**: si hay conflicto, consulta al usuario.
