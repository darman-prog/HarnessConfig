---
id: 010
status: cerrada
date: 2026-10-19
tipo: modificación
---
# Cambio — gate anti-slop en el cierre

> El detector de `impeccable` pasa a bloquear el cierre; el arquetipo High-Craft queda como preset opcional.

## Cambio
La DoD de `workflow` gana el punto de UI, `calidad-cierre` bloquea con exit 2 sin ignore y `inicio-proyecto` ofrece el preset.
## Por qué
El anti-slop vivía solo en `impeccable-doctrina`; sin gate explícito se podía cerrar con hallazgos del detector.
## Dónde mirar
- `.opencode/skills/workflow/SKILL.md` (punto 7 de la DoD)
- `.opencode/skills/calidad-cierre/SKILL.md`
- `.opencode/skills/impeccable-doctrina/references/PRESET-LINEAR.md`
## Verificación
Guardarraíl exit 0 y skills bajo tope: `workflow` 46/65, `calidad-cierre` 24/65, `impeccable-doctrina` 57/65.
## Evidencia
- Sin fuente única duplicada: la lista de reglas sigue solo en `impeccable`/`craft-floor` y `impeccable-doctrina`.
