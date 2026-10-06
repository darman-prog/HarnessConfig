---
name: api-backend
description: Convenciones backend y contrato API: endpoints REST, errores, DTOs, naming, versionado, traceId, reintentos y timeout. Usar al crear o modificar endpoints, servicios, middleware, DTOs o formato de error. No usar en tareas puramente frontend.
---

# API y convenciones backend

Puente entre `backend-expert` y `ui-ux`: ambos modelan el mismo contrato. Ãšsala cuando la feature toque endpoint, DTO o formato de error.

## Estructura

Usa `src/{domain,application,infrastructure,api}` cuando el proyecto no documente otra variante. Si el repo ya tiene estructura definida, consÃ©rvala.

## Contrato observable

- El backend es la fuente de verdad. El frontend consume lo que el backend expone; no adapta ni redefine contratos.
- Naming de campos: elige una convenciÃ³n Ãºnica para el proyecto (ej. `snake_case` en API, `camelCase` en frontend) y documÃ©ntala. Nunca mezcles en el mismo payload.
- DTOs: uno por caso de uso; no reutilices DTOs de respuesta como entrada. Los nombres del DTO son el contrato, no los de la entidad de dominio.
- Errores: formato Ãºnico `{code, message, details}` con `traceId`. El interceptor de errores del frontend consume este shape; no esperes otro.
- Endpoints bajo `/api/v1`, sustantivos, verbos HTTP correctos y paginaciÃ³n cursorial en colecciones grandes.
- Versiona los cambios rompedores en la URL, no solo en el payload.
- Un cambio rompedor (renombrar campo, cambiar tipo, quitar endpoint) se comunica **antes** de implementar.

## Requests, datos y riesgo

- Valida entradas en el borde con DTOs o esquemas; no confÃ­es solo en la validaciÃ³n del cliente.
- Propaga un `traceId` con el interceptor o middleware global de logging.
- MantÃ©n la convenciÃ³n de naming de BD del proyecto; aÃ­sla SQL y ORM en `infrastructure`.
- Evita N+1, consultas sin filtros y operaciones no acotadas.
- Reintentos con timeout solo donde la operaciÃ³n sea idempotente.

## Al diseÃ±ar una feature full-stack

1. Define el contrato (endpoint, DTO, errores) en este documento o en un ADR.
2. `backend-expert` modela el backend contra ese contrato.
3. `ui-ux` consume exactamente ese contrato en servicios e interceptores.

Si el proyecto tiene OpenAPI u otra documentaciÃ³n de API, esa es la fuente primaria; esta skill fija las convenciones. Complementa, no duplica, `arquitectura` (capas), `seguridad`, `base-datos` y `microservicios`.

Para contrato observable ampliado, migraciones, transacciones, uploads, webhooks y checklist de cierre, carga bajo demanda [CONVENCIONES-BACKEND.md](references/CONVENCIONES-BACKEND.md).