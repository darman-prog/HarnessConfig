# Auditoría de subagentes

> **Para qué:** qué roles se solapaban, qué permisos eran excesivos y qué se refinó.
> **Cuándo leerla:** antes de tocar `.opencode/agents/`, al delegar y notar roles difusos, o al revisar el presupuesto.
> **Fecha:** 2026-10-07 · **Estado:** vigente · **Método:** revisión independiente con `auditor` + verificación en runtime con `opencode run --agent`.

## 1. Resumen

Se auditaron los 8 agentes con 6 lentes: fronteras, privilegios, grafo de delegación, valor real, cobertura y presupuesto.

- **0 agentes con solape grave** tras el refactor.
- **1 bypass de escritura** (corregido y verificado en runtime).
- **3 prescripciones** que imponían convenciones inexistentes en proyectos reales.
- **3 handoffs** con ruta incompleta.
- **0 agentes nuevos.** El tope total subió de 330 a **350**; `MAX_AGENT` sigue en **45**.

Presupuesto final: **316 líneas** (`auditor` 41, `backend-expert` 31, `build` 36, `debugger` 39, `plan` 40, `quality` 42, `tester` 45, `ui-ux` 42).

## 2. Hallazgos y estado

| Severidad | Hallazgo | Estado |
| --- | --- | --- |
| BLOCKER | `auditor` es de solo lectura pero `git diff*` permite `git diff --output=<archivo>`, que escribe | **Corregido y verificado** |
| WARNING | `build` prescribía capas `domain/application/adapters/infrastructure` y `traceId` que Django, Laravel y Angular no tienen | **Corregido** |
| WARNING | `debugger` derivaba el hueco de seguridad solo a `auditor`, que no implementa el fix | **Corregido** |
| WARNING | `ui-ux` pedía motion por defecto, inflando diffs en cambios menores | **Corregido** |
| WARNING | `quality` pedía métricas de rendimiento en revisiones sin `Optimize` | **Corregido** |
| WARNING | `backend-expert` duplicaba el plan de `plan` en lugar de razonar dominio | **Corregido** |
| INFO | `tester` solapaba con `ui-ux` en revisión visual | **Delimitado**: `tester` = comportamiento/E2E, `ui-ux` = visual |

## 3. Fronteras resultantes

| Agente | Territorio | No hace |
| --- | --- | --- |
| `plan` | Secuencia y alcance verificable | Tocar código |
| `backend-expert` | Dominio, invariantes, contratos | Dar el plan de implementación |
| `build` | Editar código y tests que pasan | Sobre-entregar; imponer capas |
| `ui-ux` | Jerarquía, estados, feedback, visual | E2E; motion decorativo |
| `debugger` | Causa raíz y fix mínimo | Implementar el fix de seguridad (es de `build`) |
| `quality` | Refactor seguro y performance medida | Métricas sin `Optimize` |
| `tester` | Comportamiento y E2E | Revisión visual |
| `auditor` | Revisión, seguridad, estilo | Escribir; implementar fixes |

## 4. Permisos de solo lectura

`auditor` conserva lectura de Git (`git status/log/diff`) y bloquea los vectores de escritura:

```
"*": ask
"git diff*": allow
"git log*": allow
"git status*": allow
"*--output*": deny
"git apply*": deny
"git checkout*": deny
"git restore*": deny
"git stash*": deny
```

Verificación en runtime: `git diff --output=<archivo>` cayó en `ask` y **el archivo no se creó**; `git status` y `git diff --stat` siguieron funcionando.

## 5. Guardarraíl

`scripts/harness-budget.ps1` valida, además del presupuesto, el anti-mojibake y los caracteres de control invisibles:

| Check | Qué detecta | Fixture |
| --- | --- | --- |
| 2b | Destino de `task` inexistente o no invocable | `build` → `plan` (primary) |
| 2f | Ciclo de delegación | `ui-ux` ↔ `quality` |
| 2g | Solo lectura con vector de escritura | `auditor` sin `*--output*: deny` |

Los tres checks se probaron con fixtures negativos (exit 1) y el repo real (exit 0).

## 6. Smokes en runtime

`opencode run --agent <agente> --model opencode-go/deepseek-v4.1-flash`

| Agente | Smoke | Resultado |
| --- | --- | --- |
| `plan` | Análisis mínimo de una línea | PASS — carga sin editar |
| `backend-expert` | Modelar `Pelicula` sin pedir plan | PASS — invariantes y referencias por id, **sin plan numerado** |
| `quality` | Smell DRY sin pedir Optimize | PASS — omite `performance` y `code-clue` justificando |
| `debugger` | Login sin validar que devuelve 500 | PASS — marca hipótesis, cita `seguridad` y delega el fix |

`--agent` se verificó seleccionando el agente correcto (`> plan · deepseek-v4.1-flash`).

## 7. Grafo de delegación

```
build ──> ui-ux, backend-expert, quality, debugger, auditor, tester, explore
plan ──> backend-expert, auditor, explore
ui-ux ──> explore
backend-expert ──> explore
auditor | tester | quality | debugger ──> (sin task)
```

Acíclico y verificado. `plan` y `backend-expert` no pueden delegar en primaries.

## 8. Pendiente

- `sync-global.ps1` espeja `skills`, `agents` y `commands`, pero **no `plugins`**: quien clone la plantilla no recibe los plugins por el script.
- Repetir los smokes en la TUI tras reiniciar, para confirmar que `Tab` y `@` listan los agentes actualizados.
