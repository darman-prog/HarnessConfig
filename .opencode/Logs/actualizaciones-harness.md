# Actualizaciones del harness — registro

> **Para quién:** dev junior con TDAH — una entrada por cambio, secciones cortas y tablas; leer en 2 min.
> **Regla:** append-only; la entrada más reciente va arriba. Cada entrada dice qué cambió, por qué, cómo se verifica y cómo se revierte.
> **Alcance:** cambios al harness (config global, skills, agentes, scripts). El detalle de arquitectura está en la [auditoría v2](auditoria-skills-agentes-v2.md) y el flujo operativo en el [pipeline](pipeline-ejecucion-tareas.md).

## Historial

| Fecha | Cambio | Alcance | Estado |
| --- | --- | --- | --- |
| 2026-09-24 | Documentacion del harness: estado actual con indices + pipeline corregido con los roles nuevos | `.opencode/Logs/estado-actual-harness.md` (nuevo), `pipeline-ejecucion-tareas.md`, `auditoria-skills-agentes-v2.md` | Aplicado; referencias por seccion (sin lineas, que se pudren) |
| 2026-09-24 | Roles de agente reales: `ui-ux` y `backend-expert` a `subagent`, allowlists `permission.task` fail-closed, roster sincronizado, LF fijado en el repo | 8 agentes + `AGENTS.md` + `scripts/harness-budget.ps1` + `.gitattributes` | Aplicado; 6 checks verificados con fixture; falta reiniciar TUI y smoke |
| 2026-09-23 | Fail-closed real: cierre de frontmatter obligatorio y sync sin guardarraíl = error | `scripts/harness-budget.ps1`, `sync-global.ps1` | Aplicado; verificado con fixtures |
| 2026-09-23 | Skill `comunicacion-asertiva` (doctrina de redacción, densidad y diagramas) obligatoria en toda tarea | `.opencode/skills/comunicacion-asertiva/` + `AGENTS.md` + `uso-eficiente` §4 + guardarraíl | Aplicado; +45 tok fijos y ~+310 tok/tarea; falta reiniciar TUI y smoke de formato |
| 2026-09-23 | Gatillos de patrones (pool, proxy) y probes de trigger en el guardarraíl | `arquitectura` (description + `references/PATRONES.md`), `convenciones-frontend` (description), `AGENTS.md`, `scripts/` | Aplicado; +24 tok/sesión; falta reiniciar TUI y smoke |
| 2026-09-22 | Remediación de auditoría: guardarraíl fail-closed, allowlist de permisos, routing UI sin `npx`, descripciones recortadas | `scripts/harness-budget.ps1` + `sync-global.ps1` + agentes + 10 `SKILL.md` + `AGENTS.md` + global `opencode.jsonc` | Aplicado; verificado con fixture, guardarraíl verde y A/B de tokens (−565, −4,3%); falta reiniciar TUI |
| 2026-09-21 | Adopción de skill de review UI (`frontend-design-review`, Microsoft, adaptada) | `.opencode/skills/frontend-design-review/` + `AGENTS.md` + guardarraíl | Aplicado; smoke en TUI pendiente de reinicio |
| 2026-09-21 | Routing UI sin doble activación (filas diferenciadas + punteros cross-skill) | `AGENTS.md` + skills `convenciones-frontend`/`ui-ux` | Aplicado y medido: −0,25% (ruido); se descarta fusionar skills |
| 2026-09-19 | Notificaciones de escritorio vía plugin (Windows Terminal 1.24 ignora OSC 777) | Global (`~/.config/opencode/plugins/notify-windows.js`) | Verificado en TUI: sonido + toast al pedir permiso con el terminal fuera de foco |
| 2026-09-19 | Sonidos y notificaciones de atención en la TUI | Global (`~/.config/opencode/tui.json`) | Parcial: sonidos OK; el banner nativo no llega (ver entrada siguiente) |

<a id="sec-roles-2026-09-24"></a>
## 2026-09-24 — Roles reales de agente: invocabilidad, permisos `task` y roster

**Qué:** (1) `ui-ux` y `backend-expert` pasan de `mode: primary` a `mode: subagent` (un primary no es invocable por `Task`) y `AGENTS.md` los mueve al roster de subagents: quedan 2 primarios (`build`, `plan`) y 7 subagents. (2) Cada agente declara `permission.task`: `build` con los 7, `plan` con `backend-expert`/`auditor`/`explore` (pre-flight de seguridad, arquitectura o contratos), `ui-ux`/`backend-expert` con `explore`, y los 4 subagents con `task: deny` (sin `task` el default documentado es `allow`). (3) Textos alineados a esa topología: `build` gana el mapa de orquestación (reemplaza el bloque que repetía el Paso 0, −1 línea), los subagents "reportan para que…" en vez de "se delegan a…", 3 listas de skills fijas pasan a puntero a la tabla, y `tdd` ya no manda a un primary. (4) `.gitattributes` fija `eol=lf` para `*.md`, `*.ps1`, `*.json`, `*.jsonc`. (5) Guardarraíl: 6 checks nuevos.

**Por qué:** auditoría de los `.md` de agentes: "delega a X" no se podía cumplir (X era primary y `Task` no lo ofrece), ningún primary declaraba a quién puede lanzar, 22 archivos del harness tenían finales mezclados en la carpeta de trabajo y el contrato de LF dependía del `git config` de cada máquina.

**Verificación:** guardarraíl verde (skills=34, AGENTS.md=60, agentes=308/310); fixture con 5 agentes en conflicto → los 6 checks fallan nombrando el archivo (exit 1) y `explore` se acepta como built-in; `git ls-files --eol` → índice y carpeta de trabajo 100% LF tras normalizar, sin diff de contenido.

**Rollback:** revertir los 4 commits y borrar `.gitattributes`. Reiniciar OpenCode para que cargue los roles nuevos.

<a id="sec-failclosed-2026-09-23"></a>
## 2026-09-23 — Fail-closed real en frontmatter y sync

**Qué:** (1) `harness-budget.ps1` exige el `---` de cierre del frontmatter: sin él registra violación y se salta ese archivo (antes un `SKILL.md` sin cierre pasaba si encontraba `name:` y `description:` en el cuerpo). (2) `sync-global.ps1` hace `throw` cuando falta `scripts\harness-budget.ps1` (antes `Write-Warning` y sincronizaba a ciegas, contradiciendo el criterio de spec 001).

**Por qué:** revisión del lote de 12 commits (auditor + revisión propia) encontró dos *fail-open* reales: el frontmatter tolerante y el sync degradado. El primero permitía que una skill se midiera con metadatos que el loader no lee.

**Verificación:** fixture con `SKILL.md` sin cierre → exit 1 nombrando el archivo; copia del sync en un temporal sin `scripts/` → `throw` con exit 1; guardarraíl real verde (skills=34, AGENTS.md=60) y `sync-global.ps1` exit 0.

**Rollback:** revertir el commit (vuelve el parser tolerante y el sync con warning).

<a id="sec-comunicacion-2026-09-23"></a>
## 2026-09-23 — Skill `comunicacion-asertiva` (doctrina de redacción, densidad y diagramas)

**Qué:** nueva skill obligatoria en toda tarea (junto a `uso-eficiente`): núcleo de ~26 líneas (modo tarea con veredicto, **modo respuesta** para preguntas puras sin etiquetas, redacción sencilla, diagramas ASCII/tablas con 3+ elementos, **override** `modo detallado` / `modo resumen`, y regla de **precedencia**: si contradice a `AGENTS.md`, gana `AGENTS.md`) + `references/DOCTRINA.md` bajo demanda (escalera de densidad, plantillas, glosario de diagramas ASCII y el ejemplo malo vs bueno tomado de la auditoría real). `AGENTS.md` conserva los límites duros y añade el puntero + las dos reglas de fallback; `uso-eficiente` §4 pasa a puntero para dejar **fuente única**. Guardarraíl: +2 probes (respaldo del modo respuesta) y +3 checks fail-closed (puntero en `AGENTS.md`, límite duro "Maximo 5 bullets" solo en `AGENTS.md`, la skill declara la precedencia).

**Por qué:** las respuestas salían en 6+ párrafos sin veredicto ni densidad. La regla existía en `AGENTS.md` y en `uso-eficiente` (dos fuentes, sin doctrina); el usuario pidió una skill "siempre activa" — recordatorio estructural: lo único siempre inyectado es `AGENTS.md` + las `description`, por eso los límites duros se quedan en `AGENTS.md` y la doctrina vive en la skill.

**Verificación:** guardarraíl verde (skills=34); los 3 checks nuevos fallan en el fixture (exit 1) y el SSOT ya mordió en la primera pasada (el núcleo repetía el límite duro; se corrigió). Sin verificación automática del formato de salida: un assert con `opencode run` costaría ~12,5k tokens y el ruido no permite medirlo (ver spec 001).

**Rollback:** revertir los 3 commits. Coste: +45 tok fijos/sesión + ~310 tok por tarea; `DOCTRINA.md` solo se lee bajo demanda.

<a id="sec-triggers-2026-09-23"></a>
## 2026-09-23 — Gatillos de patrones + probes de trigger (versión ligera)

**Qué:** (1) `arquitectura` gana 3 keywords de disparo en su `description` (`pool de conexiones`, `proxy`, `reintentos`) y una sección de 3 líneas que apunta a `references/PATRONES.md`: tabla de 8 patrones con "dónde vive / cuándo sí / cuándo NO" (Factory, Builder, Specification, Strategy, Singleton, Prototype, Pool, Proxy), criterio de **módulo complejo** (2+ señales → el agente propone el patrón y espera OK; <2 señales o sin ganancia clara → no patrón) y 2 ejemplos (Pool en Python, Proxy en TypeScript). (2) La fila de `AGENTS.md` pasa a "| Capas, features, dominio, patrones (pool, proxy) |" (net-zero líneas). (3) `singleton` añadido a la description de `convenciones-frontend`: el probe lo destapó, no estaba en ningún gatillo pese a que el cuerpo de la skill lo mentiona. (4) `scripts/trigger-probes.json` (7 frases reales → skill esperada) validado por el guardarraíl en fail-closed: cada keyword debe existir en la `description` de la skill o en su fila de la tabla.

**Por qué:** 2 misses del gate observados en una sesión (review de UI y "auditar el harness" sin señal). El análisis de necesidad descartó el catálogo amplio: el modelo ya conoce los patrones y su valor es restraint, no capacidad; y su coste invisible era quemar el headroom de `description` (45) y `AGENTS.md` (60/60).

**Verificación:** guardarraíl verde (fail-closed: fixture sin `trigger-probes.json` → violación; probe con keyword inexistente → violación, el válido pasa); `+24 tokens/sesión` estimados (≈0,2%), por debajo del ruido de medición (±1-2k), por eso sin medición nueva. Smoke pendiente: reiniciar TUI y pedir "quiero un pool de conexiones reutilizable" → el gate debe declarar `arquitectura` y **proponer** el patrón.

**Rollback:** revertir los 3 commits. Disparador acordado para ampliar: 2-3 features backend con `timeout`/`retry`/`pool` ausentes en 2 semanas → reactivar el catálogo amplio con esa evidencia.

<a id="sec-remediacion-2026-09-22"></a>
## 2026-09-22 — Remediación de auditoría (4 MAJOR + recorte de tokens)

**Qué:** (1) `scripts/harness-budget.ps1` pasa a **fail-closed**: sin `name:`/`description:` en el frontmatter la skill no se mide ni se anuncia; `name` debe coincidir con la carpeta; el routing se valida **bidireccionalmente** (cada skill del repo con backticks en la tabla; cada token de la tabla existe como skill, agente o `customize-opencode`); los enlaces `reference/` y `references/` se comprueban (sin falsos positivos por ancla `#`). (2) `sync-global.ps1` cuenta skills recursivamente (`skills=33`, antes 32 por `informe-docx` anidada). (3) Allowlist de permisos en el global: `external_directory` = allow solo `~/.config/opencode` y `~/.local/share/opencode`, resto `ask`. (4) Routing UI: el agente `ui-ux` sigue la tabla, el detector corre **una pasada** con el launcher local (`.cmd detect <archivo>`, sin `npx`) y el veredicto de review lo da `frontend-design-review` (anti-doble-review); wrapper `impecable` y `references/CLI.md` sin `npx`; `impecable` pasa a obligatoria en la fila de cambio UI visible. (5) Tabla: `auditor` sale de la columna de skills, fila 25 compactada ("carga solo la que aplique"), fila nueva "Auditoría del harness → `customize-opencode`", `build` delega refactor/deuda/performance en `quality`. (6) Tokens: 10 `description` recortadas (6 outliers ≥40 → ≤30; 3 manuales → ≤15) y `uso-eficiente` 65 → 39 líneas.

**Por qué:** la auditoría del 2026-09-22 encontró 4 MAJOR (validador que pasaba en abierto con frontmatter ausente, routing que mezclaba agentes con skills, contradicción tabla↔agente↔wrapper en el flujo Impeccable, `external_directory: allow *`) y ~33% de cada sesión en overhead de metadata del harness. El guardarraíl se endureció primero para que los cambios de routing siguientes fueran verificables.

**Verificación:** guardarraíl en verde (`AGENTS.md=60`, agentes=301, skills=33); fixture con 3 violaciones (frontmatter sin `name:`, `name`≠carpeta, token inexistente en la tabla) → exit 1; `sync-global.ps1` exit 0; A/B con smoke v2 (mediana n=3, mismo día): **13.042 → 12.477 = −565 tokens/sesión (−4,3%)**; `opencode.jsonc` validado como JSON. Medición global-only v2 no completada (corrida abortada).

**Rollback:** revertir los commits; para el global, restaurar `external_directory: {"*": "allow"}` en `~/.config/opencode/opencode.jsonc`. Requiere reiniciar OpenCode (la config no es hot-reload).

<a id="sec-fdr"></a>
## 2026-09-21b — Skill de review UI adoptada (`frontend-design-review`)

**Qué:** vendorizada y adaptada la skill `frontend-design-review` de `microsoft/skills` (MIT): review estructurado de UI con 3 pilares (frictionless, quality craft, trustworthy), compliance de design system, scoring y formato de salida en `references/`.

**Por qué:** era la única candidata del catálogo `VoltAgent/awesome-agent-skills` con un eje que el harness no cubría. Descartadas: `anthropics/frontend-design` (redundante con `impeccable`), `openai/frontend-skill` (no existe en `openai/skills@main`), `google-labs-code/design-md` (redundante y requiere Stitch MCP).

**Adaptaciones locales:** `description` a 26 palabras (presupuesto ≤45); WCAG **2.2 AA** canónico en lugar de 2.1 (así el guardarraíl sigue en verde); se **eliminó el bloque de creación creativa** (duplicaba `impeccable`) y quedó como review puro (`SKILL.md` 116 líneas); regla **anti-doble-review** (esta skill da el formato/veredicto; `impeccable` ejecuta `shape`/`critique`/`audit`/`detect`); Figma/Storybook opcionales.

**Archivos:** `.opencode/skills/frontend-design-review/{SKILL.md,references/*.md}` (nuevos) · `scripts/harness-budget.ps1` (exención vendor) · `AGENTS.md` (ruteo en la fila de cambio visible) · `.opencode/skills/ui-ux/SKILL.md` (puntero) · `docs/specs/002-adopcion-frontend-design-review.md`.

**Verificación:** `harness-budget.ps1` en verde y `sync-global.ps1` exit 0 (tras reiniciar, la skill queda disponible en el global).

**Rollback:** borrar la carpeta `frontend-design-review`, revertir el commit, quitar la exención del guardarraíl y la mención en `AGENTS.md`.

**Riesgos:** solape con `impeccable` (mitigado por la regla anti-doble-review); divergencia con upstream (mantenimiento manual); +1 `description` fija por sesión (~31 palabras).

<a id="sec-ui-routing"></a>
## 2026-09-21 — Routing UI sin doble activación (A+D) y medición

**Qué:** (D) la tabla del Skill Gate separa UI de código vs cambio visible: fila "UI: codigo, componentes, estilos (sin cambio visible)" → `convenciones-frontend`; fila "Cambio UI visible o interactivo" → `ui-ux`, con `convenciones-frontend`, `accesibilidad` e `impecable`+`impeccable` como opcionales. (A) punteros cruzados de una línea entre `convenciones-frontend` y `ui-ux`, y `description` de `convenciones-frontend` orientada a código ("para cambios visibles usa ui-ux").

**Por qué:** antes las dos filas disparaban juntas en todo cambio visible (doble activación). La hipótesis era ahorro de tokens; la medición la descartó.

**Medición** (smoke de tarea UI con `opencode run --format json`, mediana n=3): **13.211 → 13.178 = −33 (−0,25%)**, dentro del ruido. Conclusión: no se justifica fusionar `convenciones-frontend` + `ui-ux` ni fragmentar la cadena; el coste dominante no está en esas skills. El cambio queda por claridad de routing, no por ahorro.

**Archivos:** `AGENTS.md` (2 filas), `.opencode/skills/convenciones-frontend/SKILL.md`, `.opencode/skills/ui-ux/SKILL.md`.

**Verificación:** `scripts/harness-budget.ps1` en verde (AGENTS.md=59, agentes=303, skills=32); `sync-global.ps1` exit 0.

**Rollback:** revertir el commit correspondiente (no hay cambios fuera del repo).

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
