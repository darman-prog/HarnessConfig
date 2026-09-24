---
id: 001
status: implementada
created: 2026-09-21
updated: 2026-09-21
---

# Reestructura de skills/agentes para ahorro de tokens

## Objetivo y alcance
Reducir el consumo de tokens del harness (AGENTS.md, skills, agentes, commands) en todos los proyectos que usan esta plantilla: deduplicación canónica (SSOT), división de skills grandes, descriptions compactas, gatillos más estrechos y un guardarraíl de presupuesto que impida la regresión.

No-objetivos: `opencode.json` global/proyecto (`tool_output`, `compaction`) queda fuera por decisión del usuario; `references/` y `scripts/` de `impeccable` (carga bajo demanda); `Logs/`; `customize-opencode` (built-in, 33ª description); proyectos ya copiados (re-sync manual, se documenta).

## Criterios de aceptación (verificables)
- `AGENTS.md` ≤60 líneas conservando el ritual "Skills:" y todas las señales del Skill Gate.
- Agentes ≤310 líneas (~40 por agente; ~80 son frontmatter de permisos); sin "Paso 0 — Skill Gate" verbatim; ritual de declaración intacto. El tope original de 230 exigía borrar metodología y formato de reporte (coste que solo se paga al invocar el agente): criterio ajustado el 2026-09-21 con OK del usuario.
- Una fuente canónica por regla: DoD (`workflow`), errores API (`contratos-api`), WCAG **2.2 AA** (`accesibilidad`; el resto remite sin versión), ahorro de tokens (`uso-eficiente`), gatillos (AGENTS.md).
- `SKILL.md` ≤65 líneas en skills auto-activables; exentas con tope ≤180: manuales (`habilidades-ofimaticas`, `informe-docx`, `notion-flow`) y vendor (`impeccable`). `contexto-proyecto` ≤65 y gatillo estrecho (solo si la tarea toca `docs/project-brain/`).
- Descriptions ≤45 palabras (≤25 en skills manuales), keywords gatillo al inicio, `name` de frontmatter intacto.
- `scripts/harness-budget.ps1` verifica los presupuestos (exit 1 si algo se pasa) e `sync-global.ps1` lo invoca.
- Medición real por CLI (`opencode run --format json`) registrada en Trazabilidad.

## Estado
Implementada (2026-09-21) en 10 commits; criterios verificados con `scripts/harness-budget.ps1` (exit 0) y medición CLI.

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
Ejecutado (2026-09-22, remediación): el texto del smoke v1 no quedó registrado, así que se fija **smoke v2** (texto literal: `Lee AGENTS.md y responde en una linea que obligacion tiene el Skill Gate.`; `opencode run --auto --format json`; se toma el `tokens.total` del último `step_finish` de cada corrida y la mediana de n=3). Las cifras de 2026-09-21 **no son comparables** con las de v2 (smoke distinto); el delta válido es el A/B con el mismo smoke: HEAD vs working tree.

## Cierre
Repo sin lint/typecheck/tests propios (harness markdown): validar con `harness-budget.ps1`, greps de integridad, medición CLI y humo en TUI. Actualizar la Trazabilidad y `AGENTS.md` (paso 4).

## Trazabilidad
Baseline 2026-09-21 (antes): `AGENTS.md` 100 líneas; 32 `SKILL.md`; 8 agentes 313 líneas; smoke `tokens.total`: 10.633 (global-only, n=1) / 14.023 (repo, n=1).
Post-cambio 2026-09-21 (mediana n=3): 10.032 (global-only) / 11.374 (repo) → **−601 (−5,7%)** y **−2.649 (−18,9%)** por sesión.
- `AGENTS.md` 100 → 59; agentes 313 → 303 (criterio ajustado a ≤310); 9 descriptions recortadas (0 exceden); `contexto-proyecto` 146 → 53 (+ `references/OPERATIVA.md`); `impecable` 71 → 52 (+ `references/CLI.md`).
- Fuentes canónicas: DoD (`workflow`), errores API (`contratos-api`), WCAG 2.2 AA (`accesibilidad`, checklist base), ahorro (`uso-eficiente` + `TOKEN-SAVING.md`).
- Commits: `f27ccec` (spec), `7a44708` (WCAG 2.2 + errores), `250566f` (divide contexto-proyecto e impecable), `716e76e` (AGENTS.md), `f64d15c` (descriptions), `cbea4ec` (agentes), `247c8f2` (craft.md), `be00d11` (AGENTS-MERGE), `d2eeb29` (guardarraíl), `docs:` de cierre (medición + `exit 0` del sync).
- Guardarraíl: verde en la plantilla y probado con fixture (detectó 8 violaciones, exit 1); `sync-global.ps1` lo ejecuta antes de copiar y ahora devuelve exit 0 en éxito (antes propagaba el 1 de robocopy).
- Excepción registrada: `impeccable/reference/craft.md` era del pack vendor (v4.2.1); un `npx impeccable update` podría reponerlo.
- Pendiente manual: humo en la TUI tras reiniciar (declarar `Skills:` y rutear bien en una tarea trivial).

### Remediación 2026-09-22 (A/B con smoke v2)
- HEAD (previo) mediana n=3: **13.042** (13.042 / 14.555 / 12.857) · working tree (post) mediana n=3: **12.477** (12.631 / 12.338 / 12.477) → **−565 tokens/sesión (−4,3%)** con el mismo smoke y el mismo día.
- Cambios que lo explican: 10 `SKILL.md` con `description` recortada (6 outliers ≥40 → ≤30 palabras; 3 manuales → ≤15) y `uso-eficiente` 65 → 39 líneas (el detalleampliado ya vivía en `references/TOKEN-SAVING.md`).
- Medición global-only v2: **no completada** (corrida abortada por el usuario; el A/B del repo es el válido). Las cifras de 2026-09-21 (10.032 / 11.374) quedan como histórico con smoke v1.
- Cambios de routing del mismo lote (no medibles en tokens, sí en corrección): `impecable` pasa a obligatoria en la fila de cambio UI visible; `auditor` sale de la columna de skills; fila de auditoría del harness; fila 25 compactada ("carga solo la que aplique"); detector de `ui-ux` en una pasada con el launcher local (sin `npx`) y veredicto de review en `frontend-design-review` (regla anti-doble-review).
- Guardarraíl endurecido en el mismo lote: frontmatter fail-closed, `name`==carpeta, routing bidireccional, enlaces `reference(s)/`; verificado con fixture (3 violaciones → exit 1) y con `sync-global.ps1` exit 0 (`skills=33`).
- Allowlist de permisos en el global (sin commit): `external_directory` = allow solo `~/.config/opencode` y `~/.local/share/opencode`, resto `ask`.

### Triggers y patrones (2026-09-23, versión ligera)
- Motivo: análisis de necesidad. Evidencia del problema: 2 misses del gate en una sesión ("crear landing y revisarla" sin señal que jalara el review de UI; "auditar el harness" sin fila en la tabla). Decisión: arreglar el **disparo** (barato, Beknown misses) y **recortar** el catálogo de patrones (el modelo ya conoce Factory/Builder/Strategy; lo que aporta es ubicación + restraint).
- Cambios: description de `arquitectura` 20 → 30 palabras (keywords `pool de conexiones`, `proxy`, `reintentos`); fila de `AGENTS.md` con "patrones (pool, proxy)" (net-zero líneas); `singleton` añadido a la description de `convenciones-frontend` (lo destapó el probe, no estaba en ningún gatillo); `arquitectura/references/PATRONES.md` (tabla de 8 patrones con "dónde vive / cuándo sí / cuándo NO" + criterio de módulo complejo con propuesta-previa-OK + 2 ejemplos: Pool en Python, Proxy en TypeScript); probes de trigger (7 frases reales) en `scripts/trigger-probes.json`, validados por el guardarraíl en modo fail-closed.
- Coste: +24 tokens/sesión fijos estimados (10 palabras de description + 6 de la fila) ≈ +0,2% de ~12,5k; guardarraíl y probes = 0 tokens en runtime. Está por debajo del ruido de medición (±1-2k entre corridas del mismo smoke), así que **no se midió**: medirlo exigiría decenas de sesiones.
- Limitación conocida: los probes validan cobertura literal de keywords (tier 1), no ruteo semántico. El smoke E2E con `opencode run` no se usa como verificación porque su ruido no detectaría ~24 tokens.
- Condición para ampliar (disparador acordado): si en 2 semanas aparecen 2-3 features backend entregados con `timeout`/`retry`/`pool` ausentes y sin que el catálogo los hubiera detectado, se reactiva el catálogo amplio con esa evidencia. Hasta entonces, YAGNI.
