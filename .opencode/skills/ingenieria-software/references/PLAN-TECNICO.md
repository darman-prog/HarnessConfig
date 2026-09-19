# Plan técnico

Usa esta plantilla después de reunir evidencia. El plan no implementa ni convierte supuestos en hechos.

## Estructura

1. **Objetivo y alcance:** resultado, no-objetivos y archivos/capas potencialmente afectados.
2. **Evidencia:** rutas, símbolos, contratos, tests y configuración observados.
3. **Estado de decisiones:** confirmadas, supuestos y pendientes; marca quién debe confirmar.
4. **Diseño mínimo:** flujo, límites y dependencias; enlaza `arquitectura` si hay cambio de capas.
5. **Tareas ordenadas:** cada una con dependencia, criterio de aceptación y validación.
6. **Riesgos y edge cases:** permisos, errores, concurrencia, datos vacíos, reintentos, compatibilidad y reversión cuando apliquen.
7. **Spike/POC:** solo con incertidumbre invalidante; indica pregunta, alcance acotado, evidencia esperada y decisión posterior.
8. **Cierre:** comandos o comprobaciones disponibles, documentación a actualizar y criterios para declarar terminado.
9. **Trazabilidad:** tests ejecutados, archivos tocados y commits de la implementación; se completa al cierre.

## Persistencia como spec

Cuando el plan supera el umbral canonico, se persiste como spec en `docs/specs/NNN-<slug>.md` del proyecto destino. El formato extiende esta plantilla (no hay SPEC-TEMPLATE aparte).

**Umbral canonico** (fuente unica; `documentacion`, `calidad-cierre` y `uso-eficiente` lo citan sin duplicarlo): cruza >1 capa/servicio; cambia contrato API/BD; requiere ADR; se estima >1 sesion o se delega a >=2 agentes; o el usuario lo pide. Excluye bugfix acotado, refactor local y UI menor.

**Formato y presupuesto** (estos topes viven solo aqui; quien los cite, los marca como derivados):

- Frontmatter minimo: `id` (NNN), `status` (`borrador` | `aprobada` | `implementada` | `obsoleta` | `superseded`), `created`, `updated`.
- Cabecera consumible (primeras <=30 lineas): frontmatter + objetivo/alcance + no-objetivos + criterios de aceptacion verificables + estado. Es lo unico que se lee por defecto.
- Tope total: <=200 lineas. Si no entra, se divide la feature o se recorta; no se infla la spec.
- Evidencia por referencia: `file:linea`, nombre de test o hash de commit. Prohibido pegar logs, diffs o salidas largas.
- Numeracion: NNN = siguiente numero libre segun glob `docs/specs/NNN-*.md` (sin reutilizar numeros).
- Autoria: `plan` es el designado; si la tarea no pasa por `plan`, la spec la materializa el agente que planifico (`build`/`ui-ux`), con el mismo formato.
- Transicion `borrador -> aprobada`: quien escribe la spec la deja en `borrador`; al recibir el OK del usuario y antes de commitear, la cambia a `aprobada` + `updated`, de modo que el commit aprobado ya la deje `aprobada` (sin commit extra).
- Lectura parcial: cabecera + seccion necesaria con `offset`/`limit`; nunca releer la spec completa dos veces en la misma sesion. Specs `obsoleta` no se cargan salvo trazabilidad explicita.

No planifiques trabajo cosmético como requisito técnico sin una señal de producto. Si la evidencia es insuficiente, detén el plan en la pregunta concreta que falta responder.
