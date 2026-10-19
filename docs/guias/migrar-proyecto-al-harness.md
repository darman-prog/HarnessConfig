# Migrar un proyecto al harness actual

> Para qué: llevar un proyecto que usa el harness desde antes del 2026-10-18 al esquema vigente (2 ficheros de reglas, una raíz de skills, umbral con canon). Leer antes de migrar.

## Qué cambia respecto al esquema anterior

| Antes | Ahora |
|---|---|
| `AGENTS.md` con el Skill Gate dentro | `OPENCODE.md` con el Skill Gate + `AGENTS.md` solo con contexto (≤35 líneas) |
| `instructions: ["AGENTS.md"]` | `instructions: ["OPENCODE.md"]` |
| `.agents/skills/` para 2 skills compartidas | Una sola raíz: `.opencode/skills/` (38 skills) |
| El umbral ">1 sesión o ≥2 agentes" repetido en varios ficheros | Canon único: la skill `documentacion` §docs/features |

## Pasos

1. **Copia los ficheros de reglas** desde el template y sepáralos:
   - `OPENCODE.md` = Skill Gate, estilo de respuesta y roster de agentes (no lo edites: es el mismo para todos).
   - `AGENTS.md` = contexto del proyecto (stack, comandos, `.gitignore`). Edita solo `## Stack` y `## Comandos`.
2. **Config**: en `.opencode/opencode.json` pon `"instructions": ["OPENCODE.md"]`. No hace falta `skills.paths`: la raíz por defecto es `.opencode/skills`.
3. **Skills**: copia `.opencode/skills/` (o deja que el global las aporte con `sync-global.ps1`). Nada de `.agents/skills/`.
4. **Guardarraíl y verificación**: copia `scripts/harness-budget.ps1`, `scripts/verify.ps1`, `scripts/smoke-routing.ps1` y `docs/harness/presupuestos.md`; el guardarraíl debe dar exit 0.
5. **Verifica**: `.\scripts\verify.ps1` (guardarraíl + identidad global + smokes de ruteo). Los smokes leen las skills del proyecto: si el proyecto no tiene `.opencode/skills/`, usa `-SkipSmokes` (el global aporta las skills en cualquier caso).
6. **Reinicia OpenCode**: la config no es hot-reload.

## Nota sobre las skills y el global

Las skills viven en el harness global (`~/.config/opencode/skills`) y se sincronizan desde la plantilla con `sync-global.ps1`. Un proyecto no necesita copiarlas: le basta con tener sus ficheros de reglas y su config. Si el proyecto tiene skills propias, van en `.opencode/skills/` del proyecto y el guardarraíl las cuenta aparte.

## Si el proyecto tiene `AGENTS.md` con el Skill Gate dentro

Copia su contenido de reglas a `OPENCODE.md` (sin tocar el proyecto) y deja en `AGENTS.md` solo el contexto. Comprueba que `AGENTS.md` queda en ≤35 líneas: si no, es que aún mezcla reglas con contexto.
