# Estado actual del harness — OpenCode

> **Para quién:** dev junior con TDAH — tablas y diagramas; leer en 5 min.
> **Para qué:** saber qué existe hoy y cómo se mueve una tarea. Complementa al [pipeline](pipeline.md) (cómo se ejecuta paso a paso); el historial por cambio vive en [changelog.md](changelog.md).
> **Fecha:** 2026-10-03 · **Estado:** vigente. Las cifras salen de la salida del guardarraíl, nunca de memoria.

<a id="sec-1"></a>
## 1. Números (verificados por el guardarraíl)

| Métrica | Valor | Tope | Nota |
| --- | --- | --- | --- |
| `AGENTS.md` | 60 líneas | 70 | Se inyecta en cada sesión |
| Agentes | 8 archivos · 310 líneas | 330 | Se pagan por invocación |
| Skills | 37 `SKILL.md` en 37 carpetas | 65 líneas c/u | 180 las exentas (vendor/manuales) |
| Specs (historia) | 3 (`001`, `002`, `003`) | sin tope ni validación desde el 2026-09-25 | ya no generan planes; `003` documenta su retirada |
| Fin de línea | LF en índice y carpeta | — | Fijado en `.gitattributes` |

<a id="sec-2"></a>
## 2. Índice de agentes

Un subagent no está en `Tab`: se lanza con `@` (manual) o lo delega un primario. Sus permisos son los suyos; no heredan nada de quien los llama.

| Agente | Modo | Color | Puede lanzar (Task) | Edita | Líneas | Cuándo |
| --- | --- | --- | --- | --- | --- | --- |
| `build` | primary | `success` | los 7 subagents | código | 34 | Implementar features y bugs; orquesta |
| `plan` | primary | `info` | `backend-expert`, `auditor`, `explore` | nada | 39 | Planificar; pre-flight con `auditor` |
| `ui-ux` | subagent | `accent` | `explore` | solo frontend | 42 | UI visible: implementar, pulir, revisar |
| `backend-expert` | subagent | — | `explore` | nada | 33 | Arquitectura, dominio, contratos |
| `auditor` | subagent | — | nadie | solo `*.md` | 36 | Revisión pre-merge y pre-flight de seguridad |
| `quality` | subagent | — | nadie | código | 42 | Deuda, refactors, hotspots medidos |
| `debugger` | subagent | — | nadie | código | 39 | Bugs no triviales con test de regresión |
| `tester` | subagent | — | nadie | nada | 45 | E2E de las webs del proyecto |
| `explore` | built-in | — | — | nada | del harness | Búsquedas amplias (no tiene `.md` aquí) |

`bash` en todos: `"*": ask` con `git diff/log/status` en `allow`. Por eso ves prompts de aprobación al ejecutar comandos.

<a id="sec-3"></a>
## 3. Índice de skills

Fuente única: la tabla del Skill Gate en `AGENTS.md` (no se copia aquí, por diseño).

| Modo | Cuántas | Cuáles | Dónde se decide |
| --- | --- | --- | --- |
| Siempre | 2 | `uso-eficiente`, `comunicacion-asertiva` | §Skill Gate, fila "Toda tarea" |
| Por tarea/señal | 33 | Incluye `code-clue` al escribir código | §Skill Gate, por tipo de tarea |
| Manuales | 2 | `habilidades-ofimaticas`, `informe-docx` | §Skill Gate, fila "Manuales" |
| **Total** | **37** | | Lo cuenta `harness-budget.ps1` |

Reglas: la tabla es la única fuente de ruteo · `references/` se lee bajo demanda · las descripciones y 17 probes comprueban el ruteo literal; `code-clue` se carga al cambiar código.

El guardarraíl (`scripts/harness-budget.ps1`) agrupa sus checks en bloques numerados al final del archivo; los de contrato son: frontmatter fail-closed, budgets, `mode`/`task` explícitos, allowlists válidas, roster coherente, `.gitattributes`, que **ni agentes ni skills** manden delegar en un primary, la convención de docs en `docs/harness` y `external_directory` sin `allow *` en el global.

<a id="sec-4"></a>
## 4. Índice de archivos

| Qué | Dónde | Nota |
| --- | --- | --- |
| Reglas de la sesión | `AGENTS.md` | Tabla del Skill Gate + estilo + roster de agentes |
| Agentes | `.opencode/agents/*.md` | El frontmatter *es* el contrato: `mode`, colores y permisos |
| Skills | `.opencode/skills/<nombre>/SKILL.md` | `references/` bajo demanda |
| Flujos MCP | `.opencode/skills/activacion-mcp/` + `docs/harness/notion.md` | Perfiles opt-in; Notion usa reglas documentales, no una skill manual |
| Guardarraíl | `scripts/harness-budget.ps1` | Exit 0 = todo en presupuesto |
| Probes de gatillo | `scripts/trigger-probes.json` | 17 casos |
| Sincronización | `sync-global.ps1` | Plantilla → `~/.config/opencode`; dry-run de purga, WARN de dependencias globales y exige reiniciar la TUI |
| Config global (fuera del repo, sin commits) | `~/.config/opencode/opencode.jsonc`, `tui.json` | `opencode.jsonc` lleva `username`, `share`, `autoupdate` y la allowlist de `external_directory` (`*` ask + allow de las 2 carpetas del harness); el proveedor vigente es `opencode-go`, nativo de OpenCode, que lee la credencial de `auth.json` — por eso no hay bloque `provider` y `commandcode` quedó fuera; **nunca** la borra el sync |
| Trazas locales | `~/.local/share/opencode/log/opencode.log` | El sync lo trunca si supera 10 MB; el histórico de julio-2026 quedó en `opencode-historico-2026-07-03_a_2026-09-24.log.bak` |
| Compresión de salidas bash (dependencia de **máquina global**, fuera del repo) | `rtk.exe` en PATH · `~/.config/opencode/plugins/rtk.ts` · `%APPDATA%\rtk\config.toml` | RTK v0.50.0 via plugin OpenCode; comprime solo test/lint/builds; excluye `git`/`powershell`/`opencode`/`ollama`; telemetría off; recall sqlite 4 días; decisión y riesgos en `docs/adr/001-rtk-dependencia-de-maquina.md`; **nunca** la borra el sync |
| Fin de línea | `.gitattributes` | `*.md`, `*.ps1`, `*.json`, `*.jsonc` en LF |
| Specs | `docs/specs/001`, `docs/specs/002` | ≤200 líneas cada una |
| Presupuestos | `docs/harness/presupuestos.md` | Fuente única de los topes del guardarraíl |
| Historial | `docs/harness/changelog.md` | Append-only: una entrada por cambio |

<a id="sec-5"></a>
## 5. Flujo de una tarea

```
  tú
   │  Tab → eliges el primario (build = verde · plan = azul)
   ▼
  primario ── Paso 0 ──> lee la tabla de AGENTS.md → carga skills → declara Skills: / omitida
   │
   ├─► trabaja: lee, edita, ejecuta comandos (tú apruebas los permisos)
   │
   ├─► Task ──> subagent (su Paso 0 + sus skills) ──> informe ≤30 líneas ──┐
   │              (edit: allow solo si su rol lo permite; bash: ask)      │
   │                                                                       │
   │◄──────────────────────────────────────────────────────────────────────┘
   │
   └─► Definition of Done (skill workflow) ──> commit por paso ──> resumen a ti
```

Claves: el subagent **no** te habla a ti (hablas con el primario) · no puede invocar a otro agente (`task: deny`) · si necesitas algo backend siendo `ui-ux`, lo reporta y `build` lo ejecuta.

<a id="sec-6"></a>
## 6. Por qué la TUI importa cuando cambias el harness

```
  editas .opencode/ (agente, skill, script, doc)
        │
        ▼
  .\scripts\harness-budget.ps1 ── exit 1 ──> corrige y repite
        │ exit 0
        ▼
  git diff + secretos ──> te propongo el commit ──> tú dices "sí" ──> git commit
        │
        ▼
  .\sync-global.ps1   (plantilla → ~/.config/opencode; exige el guardarraíl)
        │
        ▼
  REINICIAR LA TUI   ← aquí es donde se aplica el cambio
        │
        ▼
  verificas en la TUI: Tab (2 primarios) · @ (subagent) · log de Task
```

La TUI carga la config **al arrancar** y no la recarga en caliente: sin ese reinicio, estás viendo el harness anterior aunque los archivos ya estén bien.

<a id="sec-7"></a>
## 7. Comandos

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\harness-budget.ps1  # exit 0 = en presupuesto
.\sync-global.ps1                                                                 # plantilla -> global (luego reinicia)
.\sync-global.ps1 -ForcePurge                                                      # aprueba borrar los obsoletos que el dry-run liste
git ls-files --eol                                                                # i/lf y w/lf en todo
git status --short                                                                # solo lo que falta commitear
```

<a id="sec-8"></a>
## 8. Verificado y pendiente

| Verificado (2026-10-04) | Evidencia |
| --- | --- |
| Guardarraíl en verde con routing nuevo | `AGENTS.md` 67/70 · agentes 310/330 · skills 37 |
| Probes de routing | 17 casos pasan; incluyen producto, code-clue, investigación web, datos, automatización y MCP |
| `code-clue` universal | Fixture: movida a Opcional → guardarraíl exit 1; obligatoria en fila de escritura de código → exit 0 |
| Check 4b: Skill Gate solo-skills | Fixture: `auditor` en columna Opcional → exit 1 nombrando el token; revertido → exit 0 |
| Check 3b: rutas en texto plano | Fixture: `reference/nonexistent.md` en `degraded/` → exit 1; revertido → exit 0 |
| Producto y roadmap | `criterio-producto` + `planeacion-proyectos` fusionadas en `criterio-proyecto`; 2 referencias detalladas bajo demanda |
| Notion/MCP | Flujo conservado en `docs/harness/notion.md`; `activacion-mcp` explica perfiles opt-in |
| Sync `-ForcePurge` | Aplicado: purgadas 3 carpetas obsoletas del global (`criterio-producto`, `planeacion-proyectos`, `notion-flow`); identidad OK con 37 `SKILL.md` |
| Skills variadas | `investigacion-web`, `analisis-datos`, `automatizacion` añadidas con probes |
| Skills sin anidamiento | 37 carpetas = 37 `SKILL.md`; `informe-docx` sigue como skill propia |
| RTK probes (4/4) | `git status` → vacío/exit 1 · `vitest run` → `rtk vitest` · `sync-global.ps1` → exit 1 · `python manage.py test` → passthrough |
| RTK hash del plugin | `Get-FileHash` → `2D8CEF48...` = ADR (parche Windows intacto) |
| RTK humo con agente | `npx vitest run` → `rtk vitest`, salida `PASS (1) FAIL (0)` |
| RTK métricas gate (baseline) | `rtk gain --daily` → 69,3% ahorro total (35,6K tokens) · 2026-10-03: 78,5% · `rtk gain --recalls` → 33%/50% ("-", sin datos suficientes) · `opencode stats` → 344 sesiones, $90.01 |
| RTK filtros documentados | `uso-eficiente`: regla general `rtk <herramienta>` + excepción `git` · `testing`: orden de invocación + tabla medida (93,5% playwright / 83,9% vitest / 0,8% `npm run e2e`) |
| Paridad repo ↔ global | Espejo exacto en skills/agents/commands (111 archivos, MD5 idénticos) |

| Pendiente | Detalle |
| --- | --- |
| Humos F0–F6 en la TUI | Tab = 2 primarios · `@` responde · `build` delega a `ui-ux` · `plan` consulta a `auditor` · 4 denegaciones |
| `logLevel: WARN` | Se aplica **después** de los humos: elimina las líneas con comandos bash del log, pero también la evidencia `permission=task` |
| Reinicio + humos TUI | Recargar skills y comprobar las nuevas rutas en una sesión real |
| RTK gate 2026-10-12 | Baseline registrada (69,3% ahorro total). Cierra el 12-10 con `rtk gain --daily` + `rtk gain --recalls` + `opencode stats` antes/después; <5% ahorro → desinstalar |

Riesgo aceptado (decisión del usuario): el contenido de los prompts va al proveedor del modelo que se elija; `command-code` (`api.commandcode.ai`) está configurado por el usuario y se considera de confianza.

<a id="sec-9"></a>
## 9. Cómo se mantiene este doc

- Se **reescribe** al cerrar cada cambio de harness (lo hace `build`); no se acumula: el historial por cambio está en [changelog.md](changelog.md).
- Las cifras se copian de la salida del guardarraíl; las referencias usan **sección**, nunca línea (las líneas se pudren: por eso el pipeline dejó de citar números de línea de `AGENTS.md`).
- Si un número aquí no coincide con el guardarraíl, el que miente es este doc.
