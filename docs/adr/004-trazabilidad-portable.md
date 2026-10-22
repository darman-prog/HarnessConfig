# ADR-004 — Trazabilidad portable para todos los proyectos

**Fecha:** 2026-10-22
**Estado:** Activa
**Decisión:** el trabajo se registra en tres artefactos (cola, expediente y registro) con una herramienta que vive en la skill `documentacion` y viaja con `sync-global`; la evidencia la escribe un script que ejecuta el comando del criterio, no el modelo.

## Contexto

El DDR registraba al cerrar y solo los cambios que duraban más de una sesión. El trabajo de una sesión no dejaba rastro mientras se hacía, y si la sesión se cortaba, se perdía. Además, la evidencia era prosa autodeclarada ("guardarraíl exit 0"), que la siguiente sesión trataba como verdad aunque no se hubiera ejecutado nada.

La herramienta tampoco podía vivir en `scripts/` del repo: `sync-global.ps1` solo sincroniza `.opencode/skills`, `.opencode/agents` y `.opencode/commands`. Todo lo demás no llega a los proyectos.

## Decisión

1. Tres artefactos por proyecto: **cola** (`docs/features/BACKLOG.md`, solo trabajo abierto), **expediente** (`docs/features/NNN-*.md`, con criterios y bitácora) y **registro** (`docs/features/INDEX.md`).
2. La herramienta (`trace.py`) vive dentro de la skill `documentacion` y se distribuye con `sync-global`. Cada proyecto guarda solo sus datos.
3. La evidencia es mecánica: `record` ejecuta **solo** el comando escrito en el criterio aprobado y guarda código de salida y SHA; nunca la salida estándar.
4. Un dueño por estado: el backlog manda mientras está abierto; el expediente manda al cerrar. `close` verifica la evidencia y borra la fila del backlog.
5. `inicio-proyecto` inicializa la trazabilidad siempre en proyectos nuevos; `adopt` prepara los existentes y avisa si tienen reglas locales que anulan las globales.
6. Dos verificadores: `trace.py check` (cualquier proyecto) y el bloque 13 del guardarraíl, que lo invoca en este repo sin reimplementar la lógica.

## Consecuencias

- Positivas: se puede auditar un cambio sin leer código; la cadena tarea → expediente → commit → changelog se sigue en ambos sentidos; el coste fijo por sesión no cambia porque los registros no se inyectan.
- Negativas: cada cambio auditable añade ceremonia de bitácora; un único `BACKLOG.md` puede dar conflictos pequeños en ramas paralelas; el redactado de secretos es heurístico.
- Residual: que un comando salga 0 no prueba que fuera la comprobación adecuada. Por eso el comando debe ser el del criterio aprobado, y la revisión humana sigue siendo la última línea.

## Alternativas descartadas

- **Carpetas por tipo (UI, backend, infra)**: rompe el cálculo de IDs y los enlaces del índice, y una tarea mixta no tiene carpeta correcta.
- **Un backlog por área**: exige IDs globales calculados entre archivos y un archivo extra para tareas transversales.
- **GitHub Issues**: depende de red y de `gh`; no vive en el repo y el guardarraíl no puede validarlo.
- **Spec solo para cambios multi-sesión**: deja sin rastro el trabajo de una sesión, que es justo lo que se quería auditar.
- **Evidencia en prosa**: el modelo puede escribirla sin ejecutar nada; es el fallo que este diseño corrige.
