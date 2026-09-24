# AGENTS.md

Plantilla base OpenCode.

## Stack
Ver `.opencode/` para skills y config. Si esta seccion sigue vacia al iniciar un proyecto, el agente debe preguntar el stack al usuario (flujo en skill `uso-eficiente`, seccion "Onboarding de stack") y luego proponer `/init`.

## Comandos
- `opencode` (TUI) · `/init` (regenerar este archivo si cambia el stack) · `.\sync-global.ps1` (sincronizar skills/agentes/commands al harness global; reiniciar TUI despues)

## Skill Gate (obligatorio antes de leer, buscar o editar)

Antes de la primera accion: identifica skills con la tabla, carga cada una con la herramienta `skill` (este archivo NO sustituye a la skill) y declara en tu primer mensaje `Skills: <cargadas>`; si omites una candidata, `omitida <nombre>: <motivo>`. Carga solo las obligatorias al inicio; las opcionales cuando el alcance las active, declarando `Cargadas durante tarea: <nueva>` (nunca "por si acaso").

| Senal en la tarea | Obligatoria | Opcional (solo si aplica) |
| --- | --- | --- |
| Toda tarea (buscar, leer, planificar, responder) | `uso-eficiente`, `comunicacion-asertiva` | — |
| Commits, ramas, PRs, cierre | `workflow` | — |
| Capas, features, dominio, patrones (pool, proxy) | `arquitectura` | `microservicios` |
| Endpoints, errores, DTOs, servicios backend | `convenciones-backend` | `contratos-api` |
| UI: codigo, componentes, estilos (sin cambio visible) | `convenciones-frontend` | `accesibilidad` |
| Cambio UI visible o interactivo | `ui-ux`, `impecable` | `convenciones-frontend`, `accesibilidad`, `impeccable`, `frontend-design-review` |
| Auth, inputs, secretos, validacion, CORS | `seguridad` | — |
| Escribir o revisar tests | `testing` | `tdd` |
| Bug no trivial (diagnostico), refactor (deuda) o rendimiento (medido): carga solo la que aplique | `debugging` / `refactoring` / `performance` | `observabilidad`, `code-quality` |
| Esquema, migraciones, seeds | `base-datos` | — |
| READMEs, ADRs, specs | `documentacion` | — |
| Onboarding / contexto del proyecto (project-brain) | `inicio-proyecto`, `contexto-proyecto` | — |
| Producto y roadmap (alcance, prioridades, MVP, backlog) | `criterio-producto`, `planeacion-proyectos` | — |
| Plan tecnico, dependencias, spike/POC | `ingenieria-software` | `arquitectura` |
| Cierre de una implementacion o cambio | `calidad-cierre` | `testing`, `seguridad` |
| Deploy, pipeline, rollback | `despliegue` | `infraestructura` |
| Docker, compose, IaC, operacion | `infraestructura` | — |
| Editar `.opencode/` (agentes, skills, config) | `customize-opencode` | — |
| Auditar el harness o su config (skills, agentes, scripts, permisos) | `customize-opencode` | `testing`, `auditor` |
| Manuales (solo si el usuario las invoca) | `habilidades-ofimaticas`, `informe-docx`, `notion-flow` | — |

Regla anti-omision: si la `description` de una skill menciona un verbo o dominio presente en la tarea, cargala aunque creas conocerla o este resumida aqui.

## Estilo de respuesta (obligatorio para todos los agentes)
Formato por defecto (perfil del usuario: directo, sin rodeos):
1. **Primera linea = veredicto**: `Hecho:` / `Pendiente:` / `Bloqueado:` + resumen en una frase.
2. **Maximo 5 bullets** con lo esencial: que se hizo, que falta, que decision tuya falta.
3. Termina si hace falta con `¿Detallo algo?`; nunca expandas sin que te lo pidan.
Excepciones (detalle COMPLETO aunque rompa el limite): preguntas de clarificacion, planes, ADRs y docs; hallazgos BLOCKER, riesgos de seguridad/perdida de datos o decisiones irreversibles. Prohibido: preambulos, repetir el plan, re-explicar lo ya dicho. Doctrina de redaccion, densidad y diagramas: skill `comunicacion-asertiva` (en preguntas puras responde sin etiquetas; respeta "modo detallado" como override del usuario).

## Definition of Done
Canonica en la skill `workflow` (lint/typecheck/tests, diff, secretos, cambios enfocados con tests, docs, contratos API, UI+impeccable). No la dupliques.

## Tokens y contexto
Reglas en la skill `uso-eficiente`; detalle en `references/TOKEN-SAVING.md` (leerlo en exploracion amplia). `grep`/`glob` antes que `read`; no re-leas archivos ya vistos: este archivo es cache.

## Manejo de `.gitignore`
Puedes crear `.gitignore` (raiz o subdirectorios) y agregar entradas. **Nunca elimines ni sobrescribas las existentes**: si hay conflicto, consulta al usuario.

## Agentes
- Primarios (Tab): `build`, `plan`, `ui-ux` (frontend, edita), `backend-expert` (solo analiza y planifica).
- Subagentes: `auditor`, `tester`, `quality`, `debugger`, `explore`.
- `calidad-cierre` es el gate de cierre (delegable); no sustituye `testing`, `seguridad`, `auditor` ni las skills de diseño.
- Modelos se asignan manualmente por agente.
