---
name: convenciones-backend
description: Convenciones backend: API REST, estructura, errores e interceptores. Usar al crear endpoints, servicios, middleware o DTOs. No usar en tareas puramente frontend.
---

# Convenciones Backend

Usa esta estructura base cuando el proyecto no documente una variante: `src/{domain,application,infrastructure,api}`. Conserva la estructura existente si ya esta definida por el repositorio.

- Expone endpoints bajo `/api/v1` y usa sustantivos, verbos HTTP correctos y codigos de estado coherentes.
- Valida entradas en el borde mediante DTOs o esquemas; no confies solo en la validacion del cliente.
- Errores: sigue el contrato de `contratos-api`; nunca incluyas stack traces, secretos ni datos internos.
- Propaga un `traceId` mediante el interceptor o middleware global de logging.
- Usa paginacion cursorial para colecciones grandes y documenta limites y orden.
- Mantiene la convencion de naming de BD del proyecto (ej. `snake_case` en tablas y columnas); aisla SQL y ORM en infrastructure.
- Evita N+1, consultas sin filtros y operaciones no acotadas.

No incluye tutoriales ni sintaxis de Angular, Django, Spring Boot, Laravel, PHP o Java. Esas tecnologias se usan con conocimiento interno; esta skill solo define integracion y convenciones del proyecto.

Para contrato observable, migraciones, transacciones, uploads, webhooks y checklist de cierre, carga bajo demanda [CONVENCIONES-BACKEND.md](references/CONVENCIONES-BACKEND.md). Complementa, no duplica, `seguridad`, `base-datos` y `contratos-api`.
