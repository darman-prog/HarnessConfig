# Convivencia OpenCode ↔ Antigravity en el repo

Para qué sirve este doc: explica qué fichero de reglas lee cada harness, dónde vive cada cosa y cómo no romper la convivencia. Leer antes de tocar `AGENTS.md`, `OPENCODE.md` o `.agents/skills/`.

## Mapa de ficheros

| Fichero | Quién lo lee | Contenido |
|---|---|---|
| `AGENTS.md` (raíz, ≤35 líneas) | Ambos (agnóstico) | Contexto, stack y comandos del proyecto; regla "ante la duda" y "fuera del repo"; `.gitignore` |
| `OPENCODE.md` (raíz, ≤75 líneas) | Solo OpenCode (vía `instructions`) | Skill Gate, estilo de respuesta, Definition of Done, roster de agentes |
| `GEMINI.md` (raíz, ≤75 líneas, condicional) | Solo Antigravity | Lo aporta el equipo de Antigravity; **el harness no lo crea ni lo versiona** |
| `.opencode/skills/` (36 skills) | Solo OpenCode | Skills del harness |
| `.agents/skills/` (2 skills) | Ambos (fuente única, sin duplicados) | `uso-eficiente`, `comunicacion-asertiva` |
| `~/.agents/skills/` (global) | Ambos en cualquier proyecto | Espejo de `.agents/skills/` vía `sync-global.ps1` |

## Reglas activas

- OpenCode nunca lee `GEMINI.md` ni `gemini.md`: bloqueados por `permission.read` y `permission.glob` en `.opencode/opencode.json` (patrones `*GEMINI.md`, `*gemini.md`; último match gana).
- Los denies de `read` replican los de `.env` del default de OpenCode: declararlos los sobrescribe.
- Antigravity inyecta `AGENTS.md` + `GEMINI.md` (acumulativos, `always_on`) y lee `.agents/skills/` por defecto; ignora `OPENCODE.md` (no está en su lista de ficheros).
- La tabla del Skill Gate vive **solo** en `OPENCODE.md`; el guardarraíl lo verifica (bloque 12).
- Sin dobles registros: una skill no puede existir a la vez en `.opencode/skills` y `.agents/skills` (el guardarraíl lo caza).

## Límites conocidos

- `grep` matchea el regex, no la ruta: no se puede denegar por nombre de fichero. Un `grep` de `GEMINI.md` seguiría mostrando coincidencias.
- `bash` matchea comandos, no rutas: `cat GEMINI.md` no está cubierto por el deny. No usar bash para leer ficheros bloqueados.
- Antigravity carga `.agents/skills/` al leer o editar: `.opencode/AGENTS.md` no existe a propósito (ver "Asimetría" abajo).

## Asimetría aceptada

Antigravity lee el `AGENTS.md` agnóstico (es la intención: contexto compartido), pero OpenCode ignora todo lo de Antigravity. La inversa —que Antigravity ignore `OPENCODE.md`— se cumple porque Antigravity no lo escanea.

## Runbook: replicar en otro proyecto

1. Copiar `OPENCODE.md` y el `AGENTS.md` agnóstico del template (merge de Stack/Comandos según `inicio-proyecto`).
2. En `.opencode/opencode.json`: `"instructions": ["OPENCODE.md"]` + el bloque `read`/`glob` con denies de `GEMINI.md`.
3. Crear `.agents/skills/` con `uso-eficiente` y `comunicacion-asertiva` (o copiarlas del template).
4. No crear root `AGENTS.md` con Skill Gate: el guardarraíl lo rechaza.
5. Si el proyecto usa Antigravity: aportar su `GEMINI.md` (≤75 líneas) siguiendo el §Contexto y convivencia para referencias cruzadas.
