---
id: 004
status: implementada
created: 2026-10-14
updated: 2026-10-14
---

# Runbook de instalacion de la skill evaluacion-experiencia

Runbook paso a paso (no reabre el sistema de specs; la vuelta de un sistema documental DDR/sdd-lite queda para otro tema).

## Opciones de instalacion (en otra maquina o fork)

1. Cherry-pick: `git cherry-pick <hash-commit-1>` del commit feat, luego `git cherry-pick <hash-commit-2>` del docs. Verificar en bloque final.
2. Patch: `git format-patch -2 <desde-main>` y aplicar con `git am` en la rama de trabajo.
3. Copia manual: copiar la carpeta `.opencode/skills/evaluacion-experiencia/` + fila del Skill Gate en AGENTS.md + 2 probes de `scripts/trigger-probes.json` + lineas en `calidad-cierre` e `inicio-proyecto`, luego pasar el guardarraíl.

## Verificacion posterior
- Guardarraíl: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\harness-budget.ps1` exit 0 con 38 skills, AGENTS.md 70/70.
- Triggers: las keywords "SUS" y "evaluacion-experiencia" deben estar en la description o la fila.
- Sync: `.\sync-global.ps1` exit 0, "identidad: OK"; reiniciar TUI.
- Smoke: `opencode run "mide la experiencia de usuario con SUS y UMUX-Lite"` declara `evaluacion-experiencia`.

## Rollback
- Revertir commits 1 y 2 con `git revert`; luego purgar el global con `.\sync-global.ps1 -ForcePurge`. Sin cambios en DB ni migrating.