---
name: contratos-api
description: Contrato compartido backend/frontend: errores, DTOs, snake_case/camelCase, endpoints, versionado. Usar al disenar o modificar un endpoint, DTO o formato de error.
---

# Contratos API

Skill puente entre `backend-expert` y `ui-ux`. Su proposito es que ambos modelen identico el contrato de la API. Consultala siempre que una feature toque endpoint, DTO o formato de error.

## Reglas

- La fuente de verdad del contrato es el backend. El frontend consume lo que el backend expone; no adapta ni redefine contratos.
- Naming de campos: decide una convencion unica para el proyecto (ej. `snake_case` en API, `camelCase` en frontend) y documentala. Nunca mezclar en el mismo payload.
- DTOs: un DTO por caso de uso; no reutilices DTOs de respuesta como entrada. Los nombres de campo en el DTO son el contrato, no los nombres de la entidad de dominio.
- Errores: formato unico `{code, message, details}` con `traceId`. El frontend usa este formato para su interceptor de errores; no esperes otro shape.
- Endpoints: `/api/v1`, sustantivos, verbos HTTP correctos y paginacion cursorial para colecciones. Versionar cambios rompedores en la URL, no solo en el payload.
- Cambios de contrato: cualquier cambio rompedor (renombrar campo, cambiar tipo, quitar endpoint) se comunica antes de implementar; actualiza esta skill o el ADR correspondiente con el cambio.

## Al diseñar una feature full-stack

1. Define primero el contrato (endpoint, DTO, errores) en este documento o en un ADR.
2. `backend-expert` modela el backend contra ese contrato.
3. `ui-ux` consume exactamente ese contrato en servicios e interceptores.

Si el proyecto tiene documentacion propia de API (ej. OpenAPI), esa es la fuente primaria; esta skill define las convenciones de forma consistente.
