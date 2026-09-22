---
id: 001
status: aprobada
created: 2026-09-21
updated: 2026-09-21
---

# Reestructura de skills/agentes para ahorro de tokens

## Objetivo y alcance
Reducir el consumo de tokens del harness (AGENTS.md, skills, agentes, commands) en todos los proyectos que usan esta plantilla: deduplicación canónica (SSOT), división de skills grandes, descriptions compactas, gatillos más estrechos y un guardarraíl de presupuesto que impida la regresión.

No-objetivos: `opencode.json` global/proyecto (`tool_output`, `compaction`) queda fuera por decisión del usuario; `references/` y `scripts/` de `impeccable` (carga bajo demanda); `Logs/`; `customize-opencode` (built-in, 33ª description); proyectos ya copiados (re-sync manual, se documenta).

## Criterios de aceptación (verificables)
- `AGENTS.md` ≤60 líneas conservando el ritual "Skills:" y todas las señales del Skill Gate.
- Agentes ≤230 líneas; sin "Paso 0 — Skill Gate" verbatim; ritual de declaración intacto.
- Una fuente canónica por regla: DoD (`workflow`), errores API (`contratos-api`), WCAG **2.2 AA** (`accesibilidad`; el resto remite sin versión), ahorro de tokens (`uso-eficiente`), gatillos (AGENTS.md).
- `contexto-proyecto/SKILL.md` ≤65 líneas y gatillo estrecho (solo si la tarea toca `docs/project-brain/`).
- Descriptions ≤45 palabras (≤25 en skills manuales), keywords gatillo al inicio, `name` de frontmatter intacto.
- `scripts/harness-budget.ps1` verifica los presupuestos (exit 1 si algo se pasa) e `sync-global.ps1` lo invoca.
- Medición real por CLI (`opencode run --format json`) registrada en Trazabilidad.

## Estado
Aprobada por el usuario (2026-09-21) para ejecución por `build` en 10 pasos-commit.

## Evidencia (verificada en repo, 2026-09-21)
- `AGENTS.md` = 100 líneas: DoD 65-72, reglas de ahorro 78-83, lista "Skills disponibles" 85-94, tabla del Gate 21-44.
- DoD duplicada: `workflow/SKILL.md:36-43`, `agents/build.md:33-39`, `AGENTS.md:65-72`.
- `contexto-proyecto/SKILL.md` = 146 líneas; su description lo activa en "toda tarea con project-brain".
- 32 `SKILL.md` en el repo (31 de primer nivel + `habilidades-ofimaticas/informe-docx`) + `customize-opencode` built-in = 33 descriptions.
- "Paso 0 — Skill Gate" verbatim ×8 en `.opencode/agents/` (y otra mención en `ui-ux.md:19`).
- 8 agentes = 313 líneas (39+37+52+43+33+40+37+32).
- WCAG: 2.1 en `accesibilidad` (description + `## WCAG 2.1 AA como piso`), `ui-ux.md:26,30`, `tester.md:21`, `convenciones-frontend:20`, `inicio-proyecto/references/DESIGN-TEMPLATE.md:57`; 2.2 en `ui-ux` (description).
- `commands/impeccable.md:2` repite la description de la skill `impeccable` completa.
- `docs/` no existía; este spec crea `docs/specs/`.
- Log de OpenCode sin telemetría de tokens (`tokens.(input|output|reasoning)=[1-9]` → 0 coincidencias).

## Decisiones
- Confirmadas por el usuario: reestructura completa; WCAG canónico **2.2 AA**; incluir guardarraíl y spike de medición; estrechar el gatillo de `contexto-proyecto`; `opencode.json` fuera.
- De plan: SSOT por regla; descriptions ≤45/25 palabras; contrato de retorno de subagentes (≤30 líneas, evidencia por `file:linea`, sin pegar logs); sin ADR (la política vive en `uso-eficiente` + guardarraíl); `docs/specs/` sin índice propio (glob); presupuesto por tipo (siempre-activas cuerpo mínimo, manuales description ≤25).

## Diseño mínimo
Fuentes canónicas únicas + carga bajo demanda + descriptions compactas + guardarraíl ejecutable. Contratos API/BD: N/A (harness markdown).

## Tareas ordenadas (1 commit c/u)
1. Persistir esta spec — `docs:`.
2. Deduplicar hacia canónicas: DoD, errores API (`agents/build.md:27`, `agents/tester.md:30`) y WCAG → 2.2 AA en `accesibilidad` + remisión sin versión en el resto — `docs:`.
3. Dividir `contexto-proyecto` (≤65 líneas + `references/OPERATIVA.md`) y **estrechar su gatillo**; mismo tratamiento a toda skill >60 líneas — `docs:`.
4. Adelgazar `AGENTS.md` a ~55 líneas: sin lista de skills, tabla del Gate comprimida conservando señales, DoD/ahorro como punteros, enlace a `TOKEN-SAVING.md` — `docs:`.
5. Descriptions ≤45 palabras (≤25 manuales) con keywords gatillo; incluye `commands/impeccable.md` — `docs:`.
6. Agentes: Paso 0 → 2 líneas de referencia; quitar DoD/WCAG/errores duplicados; agregar contrato de retorno de subagentes a `explore`/`tester`/`auditor`/`quality` — `refactor:`.
7. Borrar `impeccable/reference/craft.md` (alias deprecado) — `chore:`.
8. Alinear `inicio-proyecto/references/AGENTS-MERGE.md` al AGENTS.md recortado (propagación a proyectos nuevos) — `docs:`.
9. Crear `scripts/harness-budget.ps1` (presupuestos derivados por glob) e invocarlo desde `sync-global.ps1` — `feat:`.
10. Medición y cierre: baseline/post con `opencode run --format json` (n=3, mediana), greps de integridad, `sync-global.ps1`, humo en TUI; registrar en Trazabilidad — `docs:`.

Validación por paso: greps de unicidad de fuente canónica; desde el paso 9, `harness-budget.ps1` en verde.

## Riesgos / edge cases
- Recortar descriptions apaga auto-activación → keywords gatillo obligatorias; checklist por skill en el paso 5.
- Referencias cruzadas rotas → prohibido referenciar por `file:linea` interno entre skills; grep de integridad.
- El guardarraíl deriva conteos por glob (32 SKILL.md hoy); no hardcodea cifras.
- `sync-global.ps1` sobrescribe el global → ejecutarlo solo tras los greps y reiniciar TUI.
- Plantillas ya copiadas no se auto-actualizan → se documenta en el paso 10.
- Integrar un SDD/specs en proyectos destino puede re-inflar contexto → el guardarraíl limita specs a ≤200 líneas.

## Spike/POC
Ejecutado (2026-09-21): `opencode run --format json` emite `step_finish.part.tokens {total,input,output,reasoning,cache{read,write}}` → método de medición = smoke fijo + mediana de `tokens.total` (n=3).
Baseline (n=1): global-only (dir temporal, sin AGENTS.md) total=10.633; en este repo total=14.023.

## Cierre
Repo sin lint/typecheck/tests propios (harness markdown): validar con `harness-budget.ps1`, greps de integridad, medición CLI y humo en TUI. Actualizar la Trazabilidad y `AGENTS.md` (paso 4).

## Trazabilidad
Baseline 2026-09-21: `AGENTS.md` 100 líneas; 32 `SKILL.md`; 8 agentes 313 líneas; tokens del smoke: 10.633 (global) / 14.023 (repo).
Post-cambio: (completar en el paso 10) archivos tocados, commits y medición final.
