# Actualizaciones del harness — registro

> **Para quién:** dev junior con TDAH — una entrada por cambio, secciones cortas y tablas; leer en 2 min.
> **Regla:** append-only; la entrada más reciente va arriba. Cada entrada dice qué cambió, por qué, cómo se verifica y cómo se revierte.
> **Alcance:** cambios al harness (config global, skills, agentes, scripts). El detalle de arquitectura está en la [auditoría v2](auditoria-skills-agentes-v2.md) y el flujo operativo en el [pipeline](pipeline-ejecucion-tareas.md).

## Historial

| Fecha | Cambio | Alcance | Estado |
| --- | --- | --- | --- |
| 2026-09-19 | Sonidos y notificaciones de atención en la TUI | Global (`~/.config/opencode/tui.json`) | Aplicado; verificación manual post-reinicio pendiente |

<a id="sec-1"></a>
## 2026-09-19 — Sonidos de atención en la TUI

**Qué:** habilitar los sonidos nativos de OpenCode para `done`, `permission`, `question`, `error` y `subagent_done`, más notificaciones de escritorio cuando la terminal está en segundo plano.

**Por qué:** pedido del usuario (sonido al terminar una tarea y al pedir un permiso). Se descartó el truco de escribir `\a` en `AGENTS.md`: la TUI renderiza markdown y los caracteres de control no llegan al terminal; el mecanismo soportado es `attention` (desactivado por defecto).

**Config aplicada** (archivo global, no versionado en el repo; no lo toca `sync-global.ps1`, que solo copia skills/agents/commands):

`C:\Users\damez\.config\opencode\tui.json`
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "attention": {
    "enabled": true,
    "notifications": true,
    "sound": true,
    "volume": 0.5,
    "sound_pack": "opencode.default"
  }
}
```

**Cómo funciona**
- Pack builtin `opencode.default`: mp3 embebidos en el binario y reproducidos in-process (miniaudio vía `opentui.dll`; backends WASAPI/DirectSound/WinMM). No usa reproductores externos.
- `notifications: true` muestra el banner del sistema solo cuando la terminal está blurred; el sonido suena siempre que el evento dispare.
- Aplica solo a la TUI: `opencode run` no reproduce sonidos.

**Verificación** (tras reiniciar OpenCode; la config TUI se lee al arrancar)

| Prueba | Cómo | Esperado |
| --- | --- | --- |
| Permiso | pedir un comando bash no allowlisteado (`"bash": {"*": "ask"}`) | suena `permission` |
| Fin de turno | completar cualquier respuesta | suena `done` |
| Notificación | mandar la terminal a segundo plano antes del evento | banner del sistema |

**Rollback:** borrar `tui.json` o poner `attention.enabled: false`; reiniciar la TUI.

**Riesgos y límites**
- Si `opentui.dll` no carga, la TUI queda en silencio y loguea `failed to create tui audio`; cambiar a `.wav` no ayuda (mismo engine).
- No hay mute por evento en `tui.json`: `question` y `error` también suenan.
- `volume: 0.5` es punto de partida (default del schema: 0.4); se ajusta en una línea.

**Evidencia:** `~/.config/opencode/node_modules/@opencode-ai/plugin/dist/tui.d.ts:170-216,323-333` · docs `https://opencode.ai/docs/tui/` (sección Attention) y `https://opencode.ai/docs/config/` (tui.json global) · binario 1.18.31 (`opencode-ai/package.json:9`).
