# OPENCODE.md

Instrucciones de OpenCode para este repo. Complementa a `AGENTS.md` (agnóstico: contexto, stack y comandos).

## Skill Gate (obligatorio antes de leer, buscar o editar)

Antes de la primera accion: identifica skills con la tabla, carga cada una con la herramienta `skill` (este archivo NO sustituye a la skill) y declara en tu primer mensaje `Skills: <cargadas>`; si omites una candidata, `omitida <nombre>: <motivo>`. Si coinciden varias señales, combina sus skills; carga solo las obligatorias al inicio y las opcionales cuando apliquen. Toda escritura o modificación de código carga `code-clue`, sin que el usuario tenga que pedir comentarios.

| Tipo de tarea | Obligatoria | Opcional (solo si aplica) |
| --- | --- | --- |
| Toda tarea (buscar, leer, planificar, responder) | `uso-eficiente`, `comunicacion-asertiva` | — |
| Escribir o modificar código (cualquier lenguaje o proyecto) | `code-clue` | — |
| Definir producto, alcance, MVP, roadmap o prioridades | `criterio-proyecto` | `ingenieria-software` |
| Plan técnico, dependencias, spike/POC | `ingenieria-software` | `arquitectura` |
| Feature multi-sesión: feature-spec en docs/features | `documentacion`, `ingenieria-software` | `criterio-proyecto`, `contexto-proyecto` |
| Feature backend, dominio, API o jobs en background | `arquitectura`, `api-backend` | `base-datos`, `microservicios` |
| Código frontend sin cambio visual | `convenciones-frontend` | `accesibilidad` |
| Diseñar, crear, pulir o revisar UI visible/interactiva | `ui-ux`, `impeccable`, `impeccable-doctrina` | `convenciones-frontend`, `accesibilidad`, `frontend-design-review` |
| Medir UX con métricas (SUS, UMUX-Lite), factores de calidad ISO/IEC 25010/SQuaRE o informe de evaluación de experiencia | `evaluacion-experiencia` | `analisis-datos`, `proteccion-datos`, `frontend-design-review` |
| Bug no trivial o intermitente | `debugging` | `testing`, `code-quality` |
| Refactor, deuda técnica, code smells o calidad de código | `refactoring`, `code-quality` | `testing` |
| Escribir, revisar o correr tests | `testing` | `tdd` |
| Esquema, migraciones o seeds | `base-datos` | `seguridad` |
| Auth, inputs, secretos, validación o CORS | `seguridad` | `api-backend` |
| Datos personales, retención o cumplimiento | `proteccion-datos` | `seguridad` |
| Investigar hechos externos o actuales | `investigacion-web` | — |
| Analizar datasets, CSV/JSON o métricas | `analisis-datos` | — |
| Automatizar tareas repetitivas con scripts | `automatizacion` | — |
| Usar Notion, Playwright, Stitch u otra herramienta MCP | `activacion-mcp` | — |
| README, ADR, guía, tutorial o taller | `documentacion` | `contexto-proyecto` |
| Onboarding de proyecto o cambio en `docs/project-brain/` | `inicio-proyecto`, `contexto-proyecto` | — |
| Deploy, pipeline o rollback | `despliegue` | `infraestructura` |
| Docker, Compose o editar IaC/manifiestos | `infraestructura` | `despliegue` |
| Red, TLS, DNS o certificados | `infraestructura` | `seguridad` |
| Medir u optimizar rendimiento | `performance` | `observabilidad`, `code-quality` |
| Instrumentar logs, métricas o trazas | `observabilidad` | `debugging` |
| Editar `.opencode/` (agentes, skills, config) | `customize-opencode` | — |
| Auditar el harness (skills, agentes, scripts, permisos); pre-flight con `auditor` | `customize-opencode` | `testing` |
| Cierre de implementación o cambio | `calidad-cierre` | `testing`, `seguridad` |
| Commits, ramas o PRs | `workflow` | — |
| Manuales, solo por petición explícita | `habilidades-ofimaticas`, `informe-docx` | — |

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
Reglas en la skill `uso-eficiente`; detalle en `.opencode/skills/uso-eficiente/references/TOKEN-SAVING.md` (leerlo en exploracion amplia). Este archivo y `AGENTS.md` se inyectan en cada sesión.

## Agentes
- Primarios (Tab): `build`, `plan`.
- Subagentes (Task/@): `ui-ux` (frontend, edita), `backend-expert` (solo analiza y planifica), `auditor`, `tester`, `quality`, `debugger`, `explore`. No invocan a nadie: reportan y quien los delego decide.
- `calidad-cierre` es el gate de cierre (delegable); no sustituye `testing`, `seguridad`, `auditor` ni las skills de diseño.
- Modelos se asignan manualmente por agente.
