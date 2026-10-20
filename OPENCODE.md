# OPENCODE.md

Instrucciones de OpenCode para este repo. Complementa a `AGENTS.md` (agnóstico: contexto, stack y comandos).

## Skill Gate (obligatorio antes de leer, buscar o editar)

Antes de la primera accion: identifica skills con la tabla, carga cada una con la herramienta `skill` (este archivo NO sustituye a la skill) y declara en tu primer mensaje `Skills: <cargadas>`; si omites una candidata, `omitida <nombre>: <motivo>`. Si coinciden varias señales, combina sus skills; carga solo las obligatorias al inicio y las opcionales cuando apliquen. Toda escritura o modificación de código carga `code-clue`, sin que el usuario tenga que pedir comentarios.

| Tipo de tarea | Obligatoria | Opcional (solo si aplica) |
| --- | --- | --- |
| Toda tarea (buscar, leer, planificar, responder) | `uso-eficiente`, `comunicacion-asertiva` | — |
| Escribir o modificar código (cualquier lenguaje o proyecto) | `code-clue` | `code-quality` |
| Producto, alcance, MVP, roadmap, plan técnico o spike | `criterio-proyecto`, `ingenieria-software` | `arquitectura` |
| Documentación, README, ADR, guía o feature multi-sesión | `documentacion` | `contexto-proyecto`, `ingenieria-software` |
| Backend, dominio, API, jobs, esquema o migraciones | `arquitectura`, `api-backend`, `base-datos` | `microservicios` |
| Código frontend sin cambio visual | `convenciones-frontend` | `accesibilidad` |
| Diseñar, crear, pulir o revisar UI visible/interactiva | `ui-ux`, `impeccable`, `impeccable-doctrina`, `frontend-design-review` | `convenciones-frontend`, `accesibilidad` |
| Medir UX con métricas (SUS, UMUX-Lite, ISO/IEC 25010/SQuaRE) | `evaluacion-experiencia` | `analisis-datos`, `frontend-design-review` |
| Bug no trivial o intermitente | `debugging` | `testing` |
| Refactor, deuda, code smells, tests o TDD | `refactoring`, `code-quality`, `testing`, `tdd` | — |
| Auth, inputs, secretos, CORS o datos personales | `seguridad`, `proteccion-datos` | `api-backend`, `base-datos` |
| Infra, deploy, red, TLS, rendimiento u observabilidad | `infraestructura`, `despliegue`, `performance`, `observabilidad` | `seguridad` |
| Investigar, analizar datasets/CSV, automatizar o usar MCP | `investigacion-web`, `analisis-datos`, `automatizacion`, `activacion-mcp` | — |
| Onboarding, estado del proyecto, cierre o cerebro (`docs/project-brain/`) | `inicio-proyecto`, `contexto-proyecto`, `calidad-cierre` | `testing`, `seguridad` |
| Editar `.opencode/`, auditar el harness, commits o PRs | `customize-opencode`, `workflow` | `testing` |
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
Al compactar, conserva la lista de ficheros modificados, los comandos de test y las decisiones abiertas: sin eso, el resumen pierde lo que importa.
La compactacion automatica esta activa (prune: true, reserved: 8000): midela antes de cambiarla.

## Agentes
- Primarios (Tab): `build`, `plan`.
- Subagentes (Task/@): `ui-ux` (frontend, edita), `backend-expert` (solo analiza y planifica), `auditor`, `tester`, `quality`, `debugger`, `explore`. No invocan a nadie: reportan y quien los delego decide.
- `calidad-cierre` es el gate de cierre (delegable); no sustituye `testing`, `seguridad`, `auditor` ni las skills de diseño.
- Modelos se asignan manualmente por agente.
