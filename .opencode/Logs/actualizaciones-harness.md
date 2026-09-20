# Actualizaciones del harness — registro

> **Para quién:** dev junior con TDAH — una entrada por cambio, secciones cortas y tablas; leer en 2 min.
> **Regla:** append-only; la entrada más reciente va arriba. Cada entrada dice qué cambió, por qué, cómo se verifica y cómo se revierte.
> **Alcance:** cambios al harness (config global, skills, agentes, scripts). El detalle de arquitectura está en la [auditoría v2](auditoria-skills-agentes-v2.md) y el flujo operativo en el [pipeline](pipeline-ejecucion-tareas.md).

## Historial

| Fecha | Cambio | Alcance | Estado |
| --- | --- | --- | --- |
| 2026-09-19 | Notificaciones de escritorio vía plugin (Windows Terminal 1.24 ignora OSC 777) | Global (`~/.config/opencode/plugins/notify-windows.js`) | Verificado en TUI: sonido + toast al pedir permiso con el terminal fuera de foco |
| 2026-09-19 | Sonidos y notificaciones de atención en la TUI | Global (`~/.config/opencode/tui.json`) | Parcial: sonidos OK; el banner nativo no llega (ver entrada siguiente) |

<a id="sec-0"></a>
## 2026-09-19b — Notificaciones de escritorio vía plugin (Windows Terminal)

**Qué:** plugin global que emite toasts nativos de Windows en dos eventos: sesión principal completada (`session.idle`) y pedido de permiso (`permission.asked` de la API v2 / `permission.updated` de la v1).

**Por qué:** OpenCode delega la notificación al terminal emitiendo **OSC 777** (detecta `WT_SESSION`). Windows Terminal 1.24 (única versión instalada, sin Preview) ignora esa secuencia: el soporte existe solo en `main` de microsoft/terminal (PR #20012, merged 2026-06-04, issue #7718), no llegó a ningún release y cuando salga exigirá `compatibility.allowOSC777: true` (default `false`). Los sonidos sí funcionan porque se reproducen localmente (miniaudio vía `opentui.dll`). Descartados foco (WT soporta DECSET 1004) y config (`notifications: true` ya estaba activo).

**Archivo** (global, no versionado; no lo toca `sync-global.ps1`):

`C:\Users\damez\.config\opencode\plugins\notify-windows.js`

<details><summary><b>Código del plugin (copiar para restaurar)</b></summary>

```js
/**
 * Notificaciones de escritorio nativas de Windows para OpenCode.
 *
 * Por que existe: OpenCode delega las notificaciones al terminal (OSC 777).
 * Windows Terminal 1.24 no soporta esa secuencia (el soporte esta en main,
 * PR microsoft/terminal#20012, y cuando salga exigira
 * compatibility.allowOSC777=true), asi que el toast nativo nunca aparece.
 * Este plugin emite el toast por WinRT y solo cuando el terminal que hospeda
 * la sesion no esta en primer plano.
 *
 * Eventos cubiertos: fin de sesion principal (session.idle) y pedidos de
 * permiso (permission.asked de la API v2 / permission.updated de la v1).
 */

import { spawn } from "node:child_process";

// AppID de PowerShell: permite mostrar el toast sin instalar ni registrar nada.
const APP_ID =
  "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe";

const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class FgWin {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
'@
$handle = [FgWin]::GetForegroundWindow()
$fgPid = 0
[void][FgWin]::GetWindowThreadProcessId($handle, [ref]$fgPid)
$fg = (Get-Process -Id $fgPid -ErrorAction SilentlyContinue).ProcessName
if ($fg -and $env:OC_TERM_PROC -and $fg -match $env:OC_TERM_PROC) { exit 0 }
try {
  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime] | Out-Null
  $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
  $texts = $template.GetElementsByTagName('text')
  $null = $texts.Item(0).AppendChild($template.CreateTextNode($env:OC_NOTIFY_TITLE))
  $null = $texts.Item(1).AppendChild($template.CreateTextNode($env:OC_NOTIFY_BODY))
  $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($env:OC_APP_ID).Show($toast)
} catch {
  exit 1
}
`;

// Proceso del terminal que hospeda esta sesion: si esta en primer plano, no molestar.
const TERM_PATTERN = (() => {
  const names = [];
  if (process.env.WT_SESSION) names.push("WindowsTerminal");
  if (process.env.WEZTERM_EXECUTABLE) names.push("wezterm-gui");
  if (process.env.ALACRITTY_WINDOW_ID) names.push("alacritty");
  if (process.env.GHOSTTY_RESOURCES_DIR) names.push("ghostty");
  if (process.env.TERM_PROGRAM === "vscode") names.push("Code");
  if (process.env.OPENCODE_APP) names.push("OpenCode");
  return names.join("|");
})();

function notify(title, body) {
  try {
    const encoded = Buffer.from(PS_SCRIPT, "utf16le").toString("base64");
    // Spawn directo, sin detached: detached + stdio:ignore no arranca el hijo en Bun.
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-EncodedCommand", encoded],
      {
        windowsHide: true,
        stdio: ["ignore", "ignore", "pipe"],
        env: {
          ...process.env,
          OC_NOTIFY_TITLE: title,
          OC_NOTIFY_BODY: body,
          OC_APP_ID: APP_ID,
          OC_TERM_PROC: TERM_PATTERN,
        },
      },
    );
    let stderr = "";
    child.stderr?.on("data", (data) => {
      stderr += String(data);
    });
    child.on("error", () => {});
    child.on("exit", (code) => {
      if (code !== 0) console.log("[notify-windows] fallo al notificar:", code, stderr.slice(0, 300));
    });
  } catch {
    // Una notificacion nunca debe romper la sesion.
  }
}

export const WindowsNotifyPlugin = async () => {
  console.log("[notify-windows] plugin cargado");

  // sessionID -> parentID: permite ignorar el done de sesiones hijas (subagentes).
  const parents = new Map();

  return {
    event: async ({ event }) => {
      const props = event?.properties ?? {};

      if (event?.type === "session.created" || event?.type === "session.updated") {
        if (props.sessionID) parents.set(props.sessionID, props.info?.parentID);
        return;
      }

      if (event?.type === "session.deleted") {
        parents.delete(props.sessionID);
        return;
      }

      if (event?.type === "session.idle") {
        if (parents.get(props.sessionID)) return; // subagente: el done del principal llega aparte
        notify("OpenCode", "Sesion completada");
        return;
      }

      if (event?.type === "permission.asked" || event?.type === "permission.updated") {
        const kind = props.permission ?? props.type ?? "una herramienta";
        notify("OpenCode", `Pide permiso para: ${kind}`);
      }
    },
  };
};
```

</details>

**Comportamiento**
- Solo notifica si el terminal que hospeda la sesión no está en primer plano (detecta el proceso por env: `WT_SESSION` → `WindowsTerminal`, más WezTerm/Alacritty/Ghostty/VS Code/app OpenCode).
- Ignora el `session.idle` de sesiones hijas (subagentes) con el `parentID` cacheado de `session.created`/`session.updated`.
- Toast WinRT vía PowerShell con AppID de PowerShell (sin instalar módulos); se lanza detached, no bloquea la sesión.
- No reemplaza los sonidos de la entrada anterior: los complementa.

**Verificación** (realizada)

| Prueba | Resultado |
| --- | --- |
| Toast WinRT desde PowerShell | Aparece (confirmado por el usuario) |
| Guarda de foco con `foreground=WindowsTerminal` | `guardMatch=True` (no molesta con el terminal en foco) |
| Carga en sesión real (`opencode run`) | `[notify-windows] plugin cargado` |
| E2E en servidor persistente (`serve` + `run --attach`) | `start` → `shown: Sesion completada`, exit 0 |

Dos trampas encontradas en las pruebas (y su efecto en el código final):
- `spawn` con `detached: true` + `stdio: "ignore"` **no arrancaba el hijo** en el runtime Bun (sin error ni log); con spawn directo funciona.
- `opencode run` headless: el proceso termina al acabar el turno y mata el árbol de procesos, así que el toast no alcanza a mostrarse; no aplica a la TUI (servidor vivo). Tampoco hay sonidos en `run` (son de la TUI).

**Resultado (2026-09-19, tras reiniciar la TUI):** con el terminal fuera de foco, un prompt de permiso real disparó sonido `permission` + toast "Pide permiso para: bash" (confirmado por el usuario). El intento anterior no era prueba válida: el plugin aún no estaba cargado (sin reinicio) y el prompt salió con la terminal en primer plano. La ruta `done` (`session.idle`) quedó verificada en el E2E de `serve` + `run --attach`; en la TUI solo falta confirmarla saliendo a mitad de un turno.

**Rollback:** borrar `notify-windows.js`; reiniciar OpenCode.

**Riesgos y límites**
- El `console.log` de init aparece en la salida de `opencode run` (igual que el ejemplo oficial); es invisible en la TUI.
- Si el terminal pasa a soportar OSC 777 (WT 1.26 con el flag, WezTerm), el plugin duplicaría la notificación nativa: retirarlo o desactivar `attention.notifications`.
- Requiere PowerShell 5.1 + WinRT (Windows 10/11 de escritorio); `opencode serve` puro no inicializa el plugin hasta que hay sesión.
- En modo headless (`opencode run`) el toast puede no alcanzar a verse porque el proceso sale antes; los sonidos de atención tampoco existen ahí.

**Evidencia:** `~/.config/opencode/plugins/notify-windows.js` · `@opencode-ai/plugin/dist/index.d.ts:225` (hook `permission.ask`) · SDK v2 `types.gen.d.ts:1128,1225` (`permission.asked`, `session.idle`) · PR microsoft/terminal#20012 / issue #7718 · binario 1.18.31 (OSC 777 + detección `WT_SESSION`).

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

**Resultado (2026-09-19):** los sonidos funcionan; el banner nunca aparece. Causa raíz y solución en la entrada siguiente.

**Rollback:** borrar `tui.json` o poner `attention.enabled: false`; reiniciar la TUI.

**Riesgos y límites**
- Si `opentui.dll` no carga, la TUI queda en silencio y loguea `failed to create tui audio`; cambiar a `.wav` no ayuda (mismo engine).
- No hay mute por evento en `tui.json`: `question` y `error` también suenan.
- `volume: 0.5` es punto de partida (default del schema: 0.4); se ajusta en una línea.

**Evidencia:** `~/.config/opencode/node_modules/@opencode-ai/plugin/dist/tui.d.ts:170-216,323-333` · docs `https://opencode.ai/docs/tui/` (sección Attention) y `https://opencode.ai/docs/config/` (tui.json global) · binario 1.18.31 (`opencode-ai/package.json:9`).
