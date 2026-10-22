---
id: 009
status: cerrada
date: 2026-10-19
tipo: modificación
area: harness
tarea: -
---
# Cambio — recorte de tokens en descripciones y ruteo

> Las 37 descripciones locales y la tabla del Skill Gate pesan menos sin perder ningún gatillo.

## Cambio
Las `description` bajan a ~110 caracteres y la tabla de `OPENCODE.md` pasa de 31 a 18 filas agrupadas por dominio.
## Por qué
Descripciones y tabla se inyectan en todas las sesiones; el coste fijo era 3719 tokens (estimador chars/4).
## Dónde mirar
- `.opencode/skills/*/SKILL.md` (solo la línea `description`)
- `OPENCODE.md` (tabla del Skill Gate)
- `scripts/trigger-probes.json` (red de seguridad de las keywords)
## Verificación
`powershell -File scripts/harness-budget.ps1` exit 0; estimador 2228 tokens (−40%); smokes de ruteo.
## Evidencia
- Guardarraíl: `OPENCODE.md=49/75`, 38 skills, 47 probes.
- Coste fijo: 3719 → 2228 tokens.
