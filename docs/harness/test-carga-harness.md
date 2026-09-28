# Test de carga del harness — post-reinicio

**Fecha:** 2026-09-27
**Contexto:** tras restaurar `~/.config/opencode/opencode.jsonc` y reiniciar la TUI.

## Qué se probó

| # | Prueba | Comando | Resultado |
|---|---|---|---|
| 1 | Guardarraíl | `scripts\harness-budget.ps1` | **PASS** — exit 0 |
| 2 | Sync repo → global | `sync-global.ps1` | **PASS** — exit 0, identidad OK |
| 3 | Config carga en OpenCode | `opencode run --model opencode-go/longcat-2.5-preview-free "Reply with just: OK"` | **PASS** — respondió `OK` |
| 4 | Skills cargadas en TUI | Verificado por el usuario tras reinicio | **PASS** — skills visibles |

## Detalle del guardarraíl

```
Guardarrail de presupuesto OK: AGENTS.md=60 lineas (tope 60) | skills=34 archivos SKILL.md | agentes=8 archivos, 310 lineas en total (tope 310)
```

## Detalle del sync

```
Purgables: 0 (el global esta alineado con el repo).
OK: skills=34 agentes=8 commands=1 en C:\Users\damez\.config\opencode | identidad: OK
```

## Config global restaurada

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "username": "damez",
  "autoupdate": "notify",
  "share": "manual",
  "permission": {
    "skill": { "*": "allow" },
    "external_directory": {
      "*": "ask",
      "~/.config/opencode/**": "allow",
      "~/.local/share/opencode/**": "allow"
    }
  }
}
```

## Pendiente

- [ ] Verificar en sesión real que delegar a un subagente no pregunta permiso por rutas de `~/.config/opencode`
- [ ] Registrar en changelog (ya hecho — entrada 2026-09-27)
