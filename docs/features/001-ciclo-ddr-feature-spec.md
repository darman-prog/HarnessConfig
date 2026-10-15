---
id: 001
status: en-curso
created: 2026-10-14
updated: 2026-10-14
agentes: [plan, build, auditor]
sesiones_estimadas: 2
---
# Feature 001: ciclo DDR de feature-spec

## Objetivo
Que los cambios que duran >1 sesion o entre >=2 agentes trabajen desde una fuente de verdad unica y pequena (`docs/features/NNN-<slug>.md`), reanudable tras compactar leyendo solo ese archivo; el changelog queda como registro historico.

## Alcance
Este repo/harness: plantilla en `documentacion/references/FEATURE-SPEC.md`, umbral redirigido en plan/build/calidad-cierre/contexto-proyecto/pipeline, fila nueva en el Skill Gate, tope `AGENTS.md` 70->75,Esta spec misma como dogfooding.

## No-alcance
No hay sistema de specs numerado (`docs/specs/` queda como archivo 001-004); `plan` sigue sin editar (persistencia a cargo del ejecutor); sin gate automatico del guardarraíl contra feature-specs (deuda: check de BOM en references, propuesta del auditor).

## Criterios de aceptacion (verificables)
1. Plantilla `documentacion/references/FEATURE-SPEC.md` existe, <=40 lineas, con ciclo de vida y roles.
2. Guardarraíl exit 0 con AGENTS.md 71/75, 38 skills, 24 probes, agentes 317/350.
3. `docs/features` aparece en: plan.md, build.md, calidad-cierre/SKILL.md, contexto-proyecto/SKILL.md, pipeline.md (>=5 hits) y cero contradicciones "no hay spec que exigir" en doctrina vigente.
4. Fila nueva del Skill Gate solo nombra skills existentes (check 4b del guardarraíl, automatico).
5. Auditor pre-flight APROBADO con WARNINGs cerrados en pasos 1-2 (W2 capa Documentacion, W3 invariante 6, S1 ruta en plantilla).
6. `.\sync-global.ps1` exit 0 con identidad OK y smoke `opencode run` declara `documentacion`.
7. Fila resumen + entrada detallada de este cambio en `docs/harness/changelog.md`.

## Pasos numerados (= unidades de commit)
1. Canon + plantilla + invariante (feat) — commit 98d8944.
2. Ciclo/umbral/ruteo/tope 75 + probe + doctrina (feat) — commit c110456.
3. Registro: esta spec + README/INDEX/estado-actual/changelog (docs).
4. Sync global + smoke + cierre de esta spec con evidencia (docs).

## Gate de adopcion (time-boxed)
Tras completarse 3 features reales con feature-spec: entrada de changelog con adherencia (specs escritas / actualizadas / leidas al reanudar y tiempo de reanudacion). Adherencia <50% => retirar el ciclo (revert de pasos), mantener la plantilla como referencia.

## Evidencia (al cerrar)
- (completar en el paso 4)

## Cierre
- (completar en el paso 4)