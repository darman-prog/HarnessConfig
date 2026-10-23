---
id: 012
status: cerrada
date: 2026-10-22
tipo: modificación
area: docs
tarea: -
---
# Cambio — alineación de la doctrina con el umbral auditable

> La doctrina deja de hablar de "multi-sesión" y declara Python como dependencia de la trazabilidad.

## Cambio
`OPENCODE.md`, `documentacion`, `contexto-proyecto`, el probe y el smoke usan el umbral auditable; `AGENTS.md` declara Python 3.8+ y `trace.py`.

## Por qué
El umbral cambió a auditabilidad y tres textos seguían diciendo "multi-sesión"; un proyecto nuevo no sabía que la trazabilidad necesita Python.

## Cómo verificar
`harness-budget.ps1` exit 0; `verify.ps1` 16/16; `grep "multi-sesión"` sin resultados en la doctrina viva.

## Dónde mirar
- `OPENCODE.md` (tabla del Skill Gate)
- `.opencode/skills/documentacion/SKILL.md`
- `AGENTS.md` (Comandos)

## Rollback
`git revert` del commit de este cambio.

## Evidencia
- Commit de este cambio: `docs: alinea la doctrina con el umbral auditable y declara Python`.
