# Estado actual del harness — OpenCode

> **Para quién:** dev junior con TDAH — tablas y diagramas; leer en 5 min.
> **Para qué:** saber qué existe hoy y cómo se mueve una tarea. Complementa al [pipeline](pipeline.md) (cómo se ejecuta paso a paso); el historial por cambio vive en [changelog.md](changelog.md).
> **Fecha:** 2026-09-24 · **Estado:** vigente. Las cifras salen de la salida del guardarraíl, nunca de memoria.

<a id="sec-1"></a>
## 1. Números (verificados por el guardarraíl)

| Métrica | Valor | Tope | Nota |
| --- | --- | --- | --- |
| `AGENTS.md` | 60 líneas | 60 | Se inyecta en cada sesión |
| Agentes | 8 archivos · 310 líneas | 310 | Se pagan por invocación |
| Skills | 34 `SKILL.md` | 65 líneas c/u | 180 las exentas (vendor/manuales) |
| Specs | 2 (`001`, `002`) | 200 líneas c/u | `001` implementada, `002` implementada |
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
| Por señal | 29 | el resto (arquitectura, testing, seguridad, UI…) | §Skill Gate, una fila por dominio |
| Manuales | 3 | `habilidades-ofimaticas`, `informe-docx`, `notion-flow` | §Skill Gate, fila "Manuales" |
| **Total** | **34** | | Lo cuenta `harness-budget.ps1` |

Reglas: la tabla es la única fuente de ruteo · `references/` se lee bajo demanda · la descripción de la skill es su gatillo (10 probes lo verifican).

El guardarraíl tiene 7 bloques de contrato: frontmatter, budgets, `mode`/`task` explícitos, allowlists válidas, roster coherente, `.gitattributes`, y que **ni agentes ni skills** manden delegar en un primary.

<a id="sec-4"></a>
## 4. Índice de archivos

| Qué | Dónde | Nota |
| --- | --- | --- |
| Reglas de la sesión | `AGENTS.md` | Tabla del Skill Gate + estilo + roster de agentes |
| Agentes | `.opencode/agents/*.md` | El frontmatter *es* el contrato: `mode`, colores y permisos |
| Skills | `.opencode/skills/<nombre>/SKILL.md` | `references/` bajo demanda |
| Guardarraíl | `scripts/harness-budget.ps1` | Exit 0 = todo en presupuesto |
| Probes de gatillo | `scripts/trigger-probes.json` | 10 casos |
| Sincronización | `sync-global.ps1` | Plantilla → `~/.config/opencode`; dry-run de purga y exige reiniciar la TUI |
| Config global (fuera del repo, sin commits) | `~/.config/opencode/opencode.jsonc`, `tui.json` | `opencode.jsonc` lleva `share`, `autoupdate`, `logLevel`, `external_directory` y el proveedor `commandcode`; **nunca** la borra el sync |
| Trazas locales | `~/.local/share/opencode/log/opencode.log` | El sync lo trunca si supera 10 MB; el histórico de julio-2026 quedó en `opencode-historico-2026-07-03_a_2026-09-24.log.bak` |
| Fin de línea | `.gitattributes` | `*.md`, `*.ps1`, `*.json`, `*.jsonc` en LF |
| Specs | `docs/specs/001`, `docs/specs/002` | ≤200 líneas cada una |
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

| Verificado (2026-09-24) | Evidencia |
| --- | --- |
| Roles, allowlists y roster reales | Guardarraíl exit 0 con 6 checks nuevos; fixture con 5 agentes en conflicto → los 6 fallan (exit 1) |
| Presupuesto dentro de tope | `AGENTS.md` 60/60 · agentes 310/310 · skills 34 |
| Fin de línea | `git ls-files --eol`: índice y carpeta 100% LF, sin diff de contenido |
| Paridad repo ↔ global | `~/.config/opencode/agents/` coincide con el repo |
| Global = espejo del repo | `sync-global.ps1` compara los 34 `SKILL.md` (texto normalizado) y falla si difieren o sobran |
| Purga acotada y auditable | Probada con un archivo basura: sin `-ForcePurge` lo lista y para; con `-ForcePurge` lo borra y revalida |
| Skills sin delegación imposible | Fixture: 2 violaciones (una en `references/`) y 3 casos legales sin falso positivo |
| `external_directory: ask` | Editado en `opencode.jsonc`; surte efecto al reiniciar (la config no es hot-reload) |

| Pendiente | Detalle |
| --- | --- |
| Humos F0–F6 en la TUI | Tab = 2 primarios · `@` responde · `build` delega a `ui-ux` · `plan` consulta a `auditor` · 4 denegaciones |
| `logLevel: WARN` | Se aplica **después** de los humos: elimina las líneas con comandos bash del log, pero también la evidencia `permission=task` |
| Push | Los commits de esta tanda |

Riesgo aceptado (decisión del usuario): el contenido de los prompts va al proveedor del modelo que se elija; `command-code` (`api.commandcode.ai`) está configurado por el usuario y se considera de confianza.

<a id="sec-9"></a>
## 9. Cómo se mantiene este doc

- Se **reescribe** al cerrar cada cambio de harness (lo hace `build`); no se acumula: el historial por cambio está en [changelog.md](changelog.md).
- Las cifras se copian de la salida del guardarraíl; las referencias usan **sección**, nunca línea (las líneas se pudren: por eso el pipeline dejó de citar números de línea de `AGENTS.md`).
- Si un número aquí no coincide con el guardarraíl, el que miente es este doc.
