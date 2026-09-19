---
name: uso-eficiente
description: Ahorro de tokens: busqueda/lectura eficiente, delegacion, respuestas concisas y onboarding de stack si AGENTS.md esta vacio. Usar en toda tarea.
---

# Uso Eficiente

Skill transversal. Se activa en toda tarea para evitar derroche de tokens.

## 1. AGENTS.md

Si `AGENTS.md` no existe en la raiz:

1. Informar al usuario en una linea.
2. Ejecutar `/init` o crear `AGENTS.md` minimo con: estructura del proyecto, stack, comandos clave y esta skill como referencia.
3. Verificar que `opencode.json` tenga `"instructions": ["AGENTS.md"]`.

Si existe, leerlo al inicio en vez de re-explorar el repo.

### Onboarding de stack

Si la seccion "Stack" de `AGENTS.md` sigue siendo el placeholder de la plantilla:

1. Usa la tool `question` para preguntar al usuario, con opciones seleccionables:
   - Frontend: Angular / React / Vue / Svelte / ninguno
   - Backend: Django+DRF / Spring Boot / Laravel / NestJS / .NET / ninguno
   - Base de datos: PostgreSQL / MySQL / MongoDB / SQLite / otra
   - Gestor de paquetes: npm / pnpm / yarn / pip+poetry / maven / composer
   - Testing: el default del stack / otro que indique
2. Escribe las respuestas en `AGENTS.md` (secciones "Stack" y "Comandos") y confirma en una linea.
3. Sugiere ejecutar `/init` para regenerar el resto del archivo con el stack real.

## 2. Busqueda y lectura eficiente

- `grep`/`glob` primero. Nunca uses `read` para buscar.
- `read` solo con `offset`/`limit` al bloque minimo necesario.
- Batch: todas las llamadas independientes en un solo turno. Si B depende del resultado de A, NO batches: ejecuta A primero.
- Delega a agente `explore` si hay >3 archivos, o si son archivos grandes/dominio desconocido aunque sean menos.
- Para tareas de 3+ pasos usa `todowrite` y actualiza estado en cada paso.
- Carga de skills bajo demanda: al iniciar carga solo las obligatorias de la tabla del Skill Gate (AGENTS.md) y declara `Skills iniciales: <lista>`; si el alcance evoluciona y activa una opcional, cargala entonces y declara `Cargadas durante tarea: <nueva>`. No precargues opcionales "por si acaso": cada skill es contexto pagado en tokens.
- Nunca recorrer `node_modules/`, `.git/`, `dist/` ni `build/`. Acota con glob/include o filtros. En PowerShell no uses `Get-ChildItem -Recurse` sobre `.opencode/` (contiene node_modules); apunta al subdirectorio objetivo.

## 3. Delegacion por tipo de tarea

- Exploracion amplia -> `explore`
- Feature fullstack -> `build`
- UI/accesibilidad -> `ui-ux`
- Revision pre-merge -> `auditor`

No ejecutes secuencialmente lo que un subagente puede hacer aislado.

## 4. Respuestas concisas (tambien aplica a output)

- Directo y resumido. Sin preambulo ni postamble innecesario.
- Si cabe en 1-3 lineas, usa 1-3 lineas. No agregues resumen redundante.
- Lista solo lo hecho y lo pendiente. Sin tutoriales ni explicaciones no pedidas.
- Usa `file:linea` al referenciar codigo. No repitas contexto ya dado.
- Solo explica detalles si el usuario lo pide explicitamente.

## 5. Anti-patrones a evitar

- Leer el mismo archivo dos veces sin motivo (ej. para verificar un cambio propio de este turno es valido).
- Leer archivos completos para encontrar una funcion.
- Respuestas largas con repeticion del plan.
- Crear archivos de documentacion no pedidos.
- Cargar solo la skill de dominio e ignorar las transversales.
- Afirmar que se conoce una skill sin haberla cargado.

## 6. Autochequeo de cierre

Antes de declarar la tarea terminada, responde honestamente:

1. ¿Cargué todas las skills que la tabla de AGENTS.md marcaba?
2. ¿Leí más de 3 archivos sin delegar o sin acotar rangos?
3. ¿Releí o busqué dentro de directorios ignorados (`node_modules/`, `.git/`, `dist/`, `build/`)?
4. ¿Creé documentación o resúmenes no pedidos?

Si alguna respuesta es "sí" (salvo la 1 con "sí" positivo), corrige o justifica en una línea.

## 7. Manejo de contexto

- Confia en `compaction.auto` (ya configurado en `opencode.json`) para tareas largas.
- Si el usuario nota respuestas repetidas o fuera de contexto, sugiere reiniciar sesion en una linea; no intentes "arreglarlo" releyendo todo.

Para tácticas ampliadas de lectura, edición, delegación y conservación de contexto, carga bajo demanda [TOKEN-SAVING.md](references/TOKEN-SAVING.md).
