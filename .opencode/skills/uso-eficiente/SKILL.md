---
name: uso-eficiente
description: Estrategia transversal de bajo consumo de tokens: grep/glob antes que read, batch de tool calls, delegar a explore, cache de contexto, onboarding de stack. Usar en toda tarea — buscar, leer, planificar o responder.
---

# Uso Eficiente

Skill transversal. Se activa en toda tarea para evitar derroche de tokens.

## 1. AGENTS.md

- Si no existe: informa en una linea, crea `AGENTS.md` minimo (estructura, stack, comandos, esta skill) y verifica `"instructions": ["AGENTS.md"]` en `opencode.json`.
- Si existe, leelo al inicio y no re-explores el repo.
- Si "Stack" sigue siendo el placeholder de la plantilla: pregunta con `question` (frontend / backend / BD / gestor / testing), escribe las respuestas en "Stack" y "Comandos", confirma en una linea y sugiere `/init`.

## 2. Busqueda, lectura y skills

- `grep`/`glob` antes que `read`; `read` con `offset`/`limit` al bloque minimo.
- Batch: llamadas independientes en un turno; secuencial solo si B depende de A.
- Delega a `explore` con >3 archivos o dominio desconocido. 3+ pasos → `todowrite`.
- Skills: solo obligatorias al inicio (`Skills: <cargadas>`); opcionales cuando la tarea las activa (`Cargadas durante tarea: <nueva>`). Nunca precargar.
- Nunca recorrer `node_modules/`, `.git/`, `dist/`, `build/`, `__pycache__/`; acota con filtros.

## 3. Delegacion por tipo

- Exploracion → `explore` · Feature fullstack → `build` · UI → `ui-ux` · Refactor/deuda/performance → `quality` · Bug complejo → `debugger` · Revision pre-merge → `auditor` · Tests E2E → `tester`.
- No ejecutes secuencialmente lo que un subagente puede hacer aislado.
- Retorno: ≤30 lineas, evidencia `file:linea`, sin pegar logs; resume.

## 4. Respuestas y anti-patrones

- Directo: solo lo hecho y lo pendiente; sin tutoriales no pedidos. Usa `file:linea`.
- Anti-patrones: releer archivos ya leidos; leer completos para buscar una funcion; crear documentacion no pedida; cargar skills "por si acaso"; afirmar conocer una skill sin cargarla.

## 5. Cierre y contexto

- Autochequeo: skills obligatorias cargadas? mas de 3 archivos sin delegar? directorios ignorados? resumenes no pedidos? Si algo es "si" (salvo la primera), corrige o justifica en una linea.
- Confia en `compaction.auto`; si el usuario nota respuestas fuera de contexto, sugiere reiniciar sesion.
- Tacticas ampliadas: [TOKEN-SAVING.md](references/TOKEN-SAVING.md).
