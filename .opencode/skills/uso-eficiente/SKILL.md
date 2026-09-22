---
name: uso-eficiente
description: Estrategia transversal de bajo consumo de tokens (grep/glob antes que read, batch de tool calls, delegar a explore, cache de contexto, onboarding de stack). Usar en toda tarea — buscar, leer, planificar o responder — para evitar derroche de tokens.
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

1. Usa la tool `question` para preguntar al usuario (frontend / backend / BD / gestor de paquetes / testing) con opciones seleccionables.
2. Escribe las respuestas en `AGENTS.md` (secciones "Stack" y "Comandos") y confirma en una linea.
3. Sugiere ejecutar `/init` para regenerar el resto del archivo con el stack real.

## 2. Busqueda y lectura eficiente

- `grep`/`glob` antes que `read`; `read` solo con `offset`/`limit` al bloque minimo.
- Batch: llamadas independientes en un solo turno; si B depende de A, secuencial.
- Delega a `explore` si hay >3 archivos, o archivos grandes/dominio desconocido.
- 3+ pasos → `todowrite`.
- Carga de skills bajo demanda: solo obligatorias al inicio (`Skills iniciales: <lista>`); opcionales cuando la tarea las activa (`Cargadas durante tarea: <nueva>`). Nunca precargar.
- Nunca recorrer `node_modules/`, `.git/`, `dist/`, `build/` ni `__pycache__/`; acota con filtros.

## 3. Delegacion por tipo de tarea

- Exploracion amplia → `explore` · Feature fullstack → `build` · UI → `ui-ux` · Refactor/calidad → `quality` · Bug complejo → `debugger` · Revision pre-merge → `auditor`.
- No ejecutes secuencialmente lo que un subagente puede hacer aislado.
- Retorno de subagentes: ≤30 lineas, evidencia por `file:linea`, sin pegar logs ni salidas completas; resume en lugar de copiar.

## 4. Respuestas concisas

- Directo y resumido; lista solo lo hecho y lo pendiente. Sin tutoriales ni explicaciones no pedidas.
- Usa `file:linea` al referenciar codigo. Solo explica detalles si el usuario lo pide.

## 5. Anti-patrones

- Releer archivos ya leidos; leer archivos completos para buscar una funcion.
- Crear documentacion no pedida; cargar skills "por si acaso"; afirmar conocer una skill sin haberla cargado.

## 6. Autochequeo de cierre

1. ¿Cargue todas las skills obligatorias de la tabla de AGENTS.md?
2. ¿Lei mas de 3 archivos sin delegar o sin acotar rangos?
3. ¿Busque dentro de directorios ignorados?
4. ¿Cree documentacion o resumenes no pedidos?

Si alguna es "si" (salvo la 1 positiva), corrige o justifica en una linea.

## 7. Manejo de contexto

- Confia en `compaction.auto` para tareas largas; si el usuario nota respuestas fuera de contexto, sugiere reiniciar sesion en una linea.
- Tacticas ampliadas de lectura, edicion y delegacion: [TOKEN-SAVING.md](references/TOKEN-SAVING.md).
