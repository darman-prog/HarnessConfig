# AGENTS.md

Plantilla base OpenCode.

## Stack
Ver `.opencode/` para skills y config. Si esta seccion sigue vacia al iniciar un proyecto, el agente debe preguntar el stack al usuario (flujo en skill `uso-eficiente`, seccion "Onboarding de stack") y luego proponer `/init`.

## Comandos
- `opencode` - iniciar TUI
- `/init` - regenerar este archivo si cambia el stack

## Arranque de tarea — Skill Gate (obligatorio)

Antes de la primera acción (buscar, leer, planificar, editar):

1. Identifica skills aplicables con la tabla.
2. Carga cada una con la herramienta `skill`. El resumen de este AGENTS.md NO sustituye a la skill.
3. Declara en tu primer mensaje: `Skills: <cargadas>`. Si omites una candidata: `omitida <nombre>: <motivo>`.

| Señal en la tarea | Obligatoria | Opcional (solo si aplica) |
| --- | --- | --- |
| Toda tarea (incluye buscar, leer, planificar, responder) | `uso-eficiente` | — |
| Commits, ramas, PRs, cierre | `workflow` | — |
| Ubicar/diseñar capas, features, dominio | `arquitectura` | `microservicios` (sistemas distribuidos) |
| Endpoints, errores, DTOs, servicios backend | `convenciones-backend` | `contratos-api` (DTO o error nuevo) |
| UI, componentes, estilos | `convenciones-frontend` | `accesibilidad` (a11y profunda), `impecable`+`impeccable` (diseño visual) |
| Auth, inputs, secretos, validación, CORS | `seguridad` | — |
| Escribir o revisar tests | `testing` | `tdd` (lógica compleja paso a paso) |
| Bug no trivial: diagnosticar | `debugging` | `observabilidad` (diagnóstico en prod) |
| Refactor, deuda técnica | `refactoring` | `code-quality` (smells/métricas) |
| Rendimiento, caching, queries lentas | `performance` | `observabilidad` (medir en prod) |
| Esquema, migraciones, seeds | `base-datos` | — |
| READMEs, ADRs, specs | `documentacion` | — |
| Iniciar proyecto / onboarding | `inicio-proyecto` | — |
| Leer/actualizar contexto del proyecto (cerebro documental) | `contexto-proyecto` | — |
| Producto, alcance, prioridades, trade-offs | `criterio-producto` | — |
| Roadmap, MVP, hitos, backlog, replanning | `planeacion-proyectos` | — |
| Plan técnico, dependencias, spike/POC | `ingenieria-software` | `arquitectura` (capas o dominio) |
| Cambios UI visibles o interactivos | `ui-ux` | `convenciones-frontend`, `accesibilidad`, `impecable`+`impeccable` |
| Cierre de una implementación o cambio | `calidad-cierre` | `testing`, `seguridad`, `auditor`, `impecable`+`impeccable` según alcance |
| Deploy, pipeline, rollback | `despliegue` | `infraestructura` (Docker/IaC) |
| Docker, compose, IaC, operación | `infraestructura` | — |
| Editar `.opencode/` (agentes, skills, plugins, config) | `customize-opencode` | — |

Regla anti-omisión: si la descripción de una skill menciona un verbo o dominio presente en la tarea, cárgala aunque creas conocerla o AGENTS.md la resuma.

Regla de carga bajo demanda: al iniciar carga solo las obligatorias de las señales de la tarea y declara `Skills iniciales: <lista>`. Si el alcance evoluciona y activa una opcional, cárgala entonces y declara `Cargadas durante tarea: <nueva>`. No precargues opcionales "por si acaso".

## Estilo de respuesta (obligatorio para todos los agentes)

Formato por defecto (perfil del usuario: directo, sin rodeos):

1. **Primera linea = veredicto**: `Hecho:` / `Pendiente:` / `Bloqueado:` + resumen en una frase.
2. **Maximo 5 bullets** con lo esencial: que se hizo, que falta, que decision tuya falta.
3. Termina si hace falta con `¿Detallo algo?` — nunca expandas sin que te lo pidan.

Excepciones (el detalle va COMPLETO aunque rompa el limite de bullets):

- Preguntas de clarificacion y planes de trabajo (`plan`, ADRs, docs): van completos, no abreviados.
- Hallazgos BLOCKER, riesgos de seguridad/perdida de datos o decisiones irreversibles: detalle y evidencia completos siempre.

Prohibido: preambulos, postambulos, repetir el plan, re-explicar lo ya dicho, llenar espacio.

## Definition of Done (obligatoria para todo agente que implemente)
1. Correr lint, typecheck y tests con los comandos reales del repo antes de declarar terminado. Si no existen, avisarlo en una linea.
2. Revisar el diff completo (`git diff`/`git status`) antes de terminar.
3. Sin secretos, `.env` ni artefactos generados en el diff.
4. Cambios pequeños y enfocados; tests actualizados junto al cambio (skill `testing`).
5. No crear documentacion ni archivos no pedidos. Si el stack/cambios lo ameritan, proponer actualizar este archivo o un ADR.
6. Si cambio un contrato de API (endpoint, DTO, formato de error), actualizar `contratos-api` o el ADR correspondiente antes de cerrar.
7. Si tocaste UI/frontend: corre `npx impeccable detect` sobre los archivos cambiados (exit 2 = hallazgos, no termines sin resolverlos) y usa la skill `impecable` (audit/critique/polish) en features terminadas.

## Manejo de `.gitignore`

Los agentes pueden crear `.gitignore` (raiz o subdirectorios) si no existe, y pueden agregar entradas nuevas. **Nunca deben eliminar ni sobrescribir entradas existentes.** Si una entrada actual entra en conflicto con lo necesario, el agente debe consultar al usuario en vez de quitarla.

## Uso eficiente de tokens (siempre activo - no depende de skill)
- `grep`/`glob` antes que `read`. `read` solo con `offset`/`limit` al bloque minimo.
- Batch: tool calls independientes en un solo turno. Si B depende del resultado de A, NO batches: ejecuta A primero.
- Delegar a `explore` si >3 archivos, o si son archivos grandes/dominio desconocido aunque sean menos. Usar `todowrite` para 3+ pasos.
- No releer archivos ya leidos. `AGENTS.md` es cache de contexto.
- Skill `uso-eficiente` es referencia detallada; las reglas de arriba aplican siempre.

## Skills disponibles
- `arquitectura`, `base-datos`, `convenciones-backend`, `convenciones-frontend`, `contratos-api`, `despliegue`, `infraestructura` (Docker/IaC/operacion; el pipeline y rollback van en `despliegue`), `seguridad`, `workflow`, `testing`, `documentacion` (READMEs, ADRs, specs), `uso-eficiente`, `inicio-proyecto` (onboarding y setup inicial), `contexto-proyecto` (cerebro documental en `docs/project-brain/`), `criterio-producto` (alcance y trade-offs), `planeacion-proyectos` (roadmap y MVP), `ingenieria-software` (plan técnico y spikes), `calidad-cierre` (gate final), `ui-ux` (criterios agnósticos de UI), `performance` (medir primero, optimizar despues), `refactoring` (refactor seguro), `code-quality` (DRY/KISS/YAGNI, smells), `tdd` (ciclo red-green-refactor paso a paso), `debugging` (causa raiz con test de regresion), `microservicios` (sistemas distribuidos), `observabilidad` (logs/metricas/trazas), `accesibilidad` (WCAG profunda), `habilidades-ofimaticas` (manual, solo bajo peticion explicita — no auto-activa en backend-expert/ui-ux; ruta DOCX avanzada: `informe-docx` con Node + `docx` del harness global), `notion-flow` (sincroniza planes/tareas con Notion; solo si mencionas Notion o el perfil notion esta activo en `opencode.notion.json`)
- Diseno UI (par complementario, se cargan juntos en tareas de UI): `impecable` (wrapper propio: reglas de integracion del CLI `npx impeccable` con OpenCode — detector manual, enrutamiento de comandos, `PRODUCT.md`/`DESIGN.md`) e `impeccable` (skill oficial completa: playbooks por comando en `reference/` y scripts de ejecucion). `impecable` define el flujo; `impeccable` ejecuta el diseno.
- Carga solo la skill cuyo `description` matchee la tarea. No cargues skills de respaldo "por si acaso".

## Agentes
- Primarios (Tab): `build`, `plan`, `ui-ux` (frontend, edita), `backend-expert` (solo analiza y planifica, nunca toca codigo).
- Subagentes (delegables): `auditor` (revision codigo + docs, edita solo `*.md`), `tester` (E2E con browser + suites del repo, reporta bugs sin editar), `quality` (refactor/calidad/performance; puede usar `calidad-cierre` al final), `debugger` (bugs complejos hasta causa raiz), `explore` (busqueda).
- `calidad-cierre` es un gate delegable o usable por el agente principal al terminar una implementación/cambio; no crea un agente nuevo ni sustituye `testing`, `seguridad`, `auditor` o las skills de diseño.
- Modelos se asignan manualmente por agente; no estan fijos en config.
