---
id: 003
status: aprobada
created: 2026-09-25
updated: 2026-09-25
---

# Harness mas liviano: fuera sdd-lite, cerebro como memoria, permisos sin ruido

## Objetivo y alcance
Tres cambios con un mismo objetivo (menos artefactos, mas memoria, menos friccion): (1) retirar sdd-lite —umbral canonico, specs, gate y checks— sin reemplazarlo por otro sistema: la intencion y los criterios de cada cambio viven en el changelog y las decisiones de arquitectura en `docs/adr/`; (2) sembrar `docs/project-brain/` (INDEX + ARCHITECTURE) como memoria del harness, con la lectura "ante la duda" (`AGENTS.md` + `INDEX.md`) antes de preguntar o asumir; (3) allowlist de `external_directory` (las 2 carpetas del harness) con `*` ask, porque el `*` ask global anula las allowlists internas de opencode.

## No-objetivos
- No se borra `docs/specs/` (001-003 quedan como archivo inerte) ni se reescriben el changelog ni la auditoria v2.
- No se cambia la plantilla de plan tecnico (`PLAN-TECNICO.md` secciones 1-9) ni los umbrales de delegacion a subagentes: la causa del ruido era el permiso.
- No se introduce ninguna convencion nueva: `docs/adr/`, `docs/guias/` y `contexto-proyecto` ya existen.

## Criterios de aceptacion (verificables)
1. `grep -rn "docs/specs|umbral canonico|MAX_SPEC" .opencode/agents .opencode/skills AGENTS.md` → 0 coincidencias (salvo el puntero generico de `ingenieria-software/SKILL.md:17` y los falsos positivos de `frontend-design-review`/`impeccable`).
2. `harness-budget.ps1` → exit 0; bloques numerados = 9; `AGENTS.md` 60 lineas; agentes ≤310.
3. Global: `*` ask primero y las 2 rutas allow despues; tras reiniciar, leer `~/.config/opencode/**` no pregunta y `C:\Users\damez\Documentos` si.
4. Peticion de "guia tecnica / taller / tutorial" produce un `.md` en `docs/guias/`, no una spec ni un plan.
5. `docs/project-brain/INDEX.md` existe, sus enlaces resuelven y `calidad-cierre` verifica que el cambio no lo contradiga.
6. `docs/harness/presupuestos.md` existe y el guardarrail lo cita como fuente unica.
7. `sync-global.ps1` → exit 0 con identidad OK al cerrar cada lote.

## Estado
Borrador → `aprobada` con el OK del usuario → `implementada` al cerrar. Es el ultimo registro del sistema que este cambio retira: desde el lote 2 ningun plan produce specs.

## 1. Evidencia
- Merge de `feat/sdd-lite` → `main` el 2026-09-19 (`0cd212b` → `3c6899c`; `.git/logs/HEAD:11,18,19`).
- Doctrina: `.opencode/skills/ingenieria-software/references/PLAN-TECNICO.md:17-32`.
- Agentes: `.opencode/agents/plan.md:2,12,30,39`; `auditor.md:17`.
- Skills: `calidad-cierre/SKILL.md:13`; `calidad-cierre/references/GATE-FINAL.md:5`; `documentacion/SKILL.md:3,20`; `contexto-proyecto/SKILL.md:3,48,50-51`; `uso-eficiente/references/TOKEN-SAVING.md:33-41`.
- Tabla: `AGENTS.md:27` (y `:51`, ya editada en el lote 1; 60/60 → solo edicion in situ).
- Guardarrail: `scripts/harness-budget.ps1:3,6,21,29,225-235`; `$MANUALES` no incluye `contexto-proyecto` → su description admite 45 palabras (`:31-32`).
- Docs: `docs/README.md:9`; `docs/harness/estado-actual.md:15,51,67,138`; `docs/harness/pipeline.md:61,194,208,209`; `docs/harness/changelog.md:4,60-71`.
- Permisos: la allowlist de 2 rutas ya era la decision de `docs/specs/001:92`; el paso a `* ask` del 2026-09-24 la elimino. Fuentes: schema `opencode.ai/config.json`, doc de permisos (gana la ultima regla) y opencode v1.18.32 (`permission/index.ts`): `once` no cachea y `always` si; un subagent hereda reglas y estado `approved`; el `*` del usuario anula las allowlists internas (temp, skills descubiertas, references, tool-output).
- Falsos positivos a no tocar: "Figma specs" (`frontend-design-review`), vendor `impeccable`, `package-lock.json` (`@standard-schema/spec`).
- Pre-flight de `auditor` (2 rondas): la cita a spec 001 en el guardarrail era decorativa (las cifras viven en `:22-28`); el conteo de bloques del doc ya estaba obsoleto; `pipeline.md:209` apunta a lineas inexistentes; `contexto-proyecto:48` promete una verificacion del cerebro que `calidad-cierre` no hacia.

## 2. Decisiones confirmadas (usuario, 2026-09-25)
| # | Decision |
| --- | --- |
| D1 | Doctrina completa fuera; 001-003 como archivo inerte |
| D2 | Topes a `docs/harness/presupuestos.md` |
| D3 | La spec 003 se persiste y se conserva |
| D4 | Rama `feat/sdd-lite` se borra si sigue fully merged |
| D5 | Sin ADR (precedente `docs/specs/001:41`) |
| D6 | Nada reemplaza al sistema: intencion al changelog, decisiones a `docs/adr/` |
| D7 | `external_directory`: `*` ask primero, allow de `~/.config/opencode/**` y `~/.local/share/opencode/**` despues |
| D8 | Cerebro ligero en este repo (INDEX + ARCHITECTURE, sin duplicar `docs/harness/`) |
| D9 | Una guia/tutorial/taller es documentacion (`docs/guias/`), no un plan |
| D10 | Sin cambios en los umbrales de delegacion |

## 3. Tareas (por lote; cada una = un commit)
| Lote | # | Cambio | Commit |
| --- | --- | --- | --- |
| 1 | 1.1-1.3 | Allowlist de `external_directory` (global, sin commit) + reglas de contexto en `AGENTS.md:51` + docs | `c48a937 fix: deja de preguntar por permisos de directorio externo en las carpetas del harness` |
| 1 | 1.4 | Check 10 del guardarrail: `external_directory` sin `allow *` | `b3d06fd test: el guardarrail prohibe abrir external_directory en todo el disco` |
| 2 | 2.0 | Persistir esta spec | `docs: agrega la spec 003 del harness mas liviano` |
| 2 | 2.1 | `PLAN-TECNICO.md:17-32` fuera | `chore: retira del plan tecnico el umbral canonico y la persistencia de specs` |
| 2 | 2.2 | `plan.md:2,12,30,39` + `auditor.md:17` (regla barata en 30 y 39) | `chore: los agentes plan y auditor dejan de depender del sistema de specs` |
| 2 | 2.3-2.4 | 5 skills sin citas; `documentacion` gana el gatillo de guias; `AGENTS.md:27` mas ancho | `chore: las skills dejan de citar el sistema de specs` |
| 2 | 2.5 | `presupuestos.md` + enlaces | `docs: los topes del presupuesto pasan a un doc propio` |
| 2 | 2.6 | Guardarrail: sin bloque 6, sin `$MAX_SPEC`, 9 bloques | `test: el guardarrail deja de validar specs y renumera sus bloques` |
| 2 | 2.7 | `estado-actual:15`; `pipeline:208,209`; `README:9`; `changelog:4` + fila | `docs: actualiza la documentacion del harness tras retirar sdd-lite` |
| 3 | 3.1 | `project-brain/INDEX.md` + `ARCHITECTURE.md` + fila en `README.md` | `docs: siembra el cerebro documental del harness con indice y arquitectura` |
| 3 | 3.2 | `contexto-proyecto:3,48` + 1 linea en `calidad-cierre` | `chore: el agente lee el cerebro documental ante la duda en lugar de asumir` |

## 4. Validacion
- Por lote: `harness-budget.ps1` exit 0; fixtures exit 1 donde aplique; `sync-global.ps1` exit 0 con identidad OK; `AGENTS.md` = 60 lineas; sin secretos en el diff.
- Humos: L1 (subagente lee el global sin preguntar; una ruta externa si pregunta) · L2 (una guia de taller no produce spec; `plan` trivial no menciona specs) · L3 (una duda lee `INDEX.md` antes de preguntar).

## 5. Riesgos
| # | Riesgo | Manejo |
| --- | --- | --- |
| A | Global con config vieja hasta el reinicio | Sin commit pero con rollback literal en `estado-actual.md:138` y en el changelog |
| B | Allowlist tapa una ruta legitima futura | El `ask` restante la cubre con `always`; si asoma el temp, se mide antes de ampliar |
| C | Gate mas debil sin spec | `GATE-FINAL.md:5` lee criterios del plan; el gate del cerebro cubre coherencia |
| D | El cerebro se pudre | `confidence`/`source` por doc, gate al cierre y `UPDATE-RULES.md` |
| E | El check por regex del global se rompe al reestructurar | Fail-closed: si no encuentra el bloque, viola con mensaje explicito |
| F | Nada se borra: todo es reversible con `git revert` | El unico cambio no versionado es el global (resincronizable) |

## 6. Trazabilidad (al cierre)
- Commits: los de la tabla de la seccion 3 con su hash; specs 001-003 historicas; rama `feat/sdd-lite` borrada si estaba mergeada.
