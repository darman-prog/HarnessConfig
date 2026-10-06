---
name: api-backend
description: Convenciones backend y contrato API: endpoints REST, WebSocket/SSE, errores, DTOs, naming, versionado, traceId, reintentos y timeout. Usar al crear o modificar endpoints, servicios, middleware, DTOs, tiempo real, jobs en background o formato de error. No usar en tareas puramente frontend.
---

# API y convenciones backend

Puente entre `backend-expert` y `ui-ux`: ambos modelan el mismo contrato. Úsala cuando la feature toque endpoint, DTO o formato de error.

## Estructura

Usa `src/{domain,application,infrastructure,api}` cuando el proyecto no documente otra variante. Si el repo ya tiene estructura definida, consérvala.

## Contrato observable

- El backend es la fuente de verdad. El frontend consume lo que el backend expone; no adapta ni redefine contratos.
- Naming de campos: elige una convención única para el proyecto (ej. `snake_case` en API, `camelCase` en frontend) y documéntala. Nunca mezcles en el mismo payload.
- DTOs: uno por caso de uso; no reutilices DTOs de respuesta como entrada. Los nombres del DTO son el contrato, no los de la entidad de dominio.
- Errores: formato único `{code, message, details}` con `traceId`. El interceptor de errores del frontend consume este shape; no esperes otro.
- Endpoints bajo `/api/v1`, sustantivos, verbos HTTP correctos y paginación cursorial en colecciones grandes.
- Versiona los cambios rompedores en la URL, no solo en el payload.
- Un cambio rompedor (renombrar campo, cambiar tipo, quitar endpoint) se comunica **antes** de implementar.
- Si el contrato incluye tiempo real (WebSocket o SSE), el canal hereda estas mismas reglas: versionado, errores y `traceId`. El detalle operativo esta en la referencia.

## Requests, datos y riesgo

- Valida entradas en el borde con DTOs o esquemas; no confíes solo en la validación del cliente.
- Propaga un `traceId` con el interceptor o middleware global de logging.
- Mantén la convención de naming de BD del proyecto; aísla SQL y ORM en `infrastructure`.
- Evita N+1, consultas sin filtros y operaciones no acotadas.
- Reintentos con timeout solo donde la operación sea idempotente.

## Trabajo en segundo plano

- Lo que tarda mas de un segundo, llama a un tercero o puede fallar por red no se ejecuta dentro del request: se encola y se responde con un id o un estado.
- El worker es un proceso aparte del servidor web, con reintentos de backoff exponencial y limite acotado; todo job es idempotente (un reintento no duplica cobros, correos ni escrituras).
- Fallo definitivo a una cola de descartes (DLQ) con alerta; un job que falla en silencio es un bug que aparece una semana despues.
- Los procesos agendados (cron) no se solapan consigo mismos: lock o una sola instancia.

## Al diseñar una feature full-stack

1. Define el contrato (endpoint, DTO, errores) en este documento o en un ADR.
2. `backend-expert` modela el backend contra ese contrato.
3. `ui-ux` consume exactamente ese contrato en servicios e interceptores.

Si el proyecto tiene OpenAPI u otra documentación de API, esa es la fuente primaria; esta skill fija las convenciones. Complementa, no duplica, `arquitectura` (capas), `seguridad`, `base-datos` y `microservicios`.

Para contrato observable ampliado, migraciones, transacciones, uploads, webhooks y checklist de cierre, carga bajo demanda [CONVENCIONES-BACKEND.md](references/CONVENCIONES-BACKEND.md).