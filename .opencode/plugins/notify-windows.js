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
