---
name: microservicios
description: Sistemas distribuidos: cuando dividir servicios, bounded contexts, comunicacion sincronica/asincronica, timeouts, reintentos, circuit breaker, Saga, Outbox, CQRS, idempotencia y consistencia eventual. Usar al disenar o revisar arquitectura de multiples servicios, comunicacion entre apps o procesamiento de eventos. No usar en monolitos simples: empieza por arquitectura.
---

# Microservicios y sistemas distribuidos

## Cuando NO dividir

- Empieza monolito modular: capas claras (skill `arquitectura`) con limites internos firmes.
- Dividir requiere causa real: equipos distintos, escalado divergente, deploy independiente. "Se ve mas pro" no es causa.
- Un modulo con DB compartida no es un servicio: si dos servicios comparten schema, todavia es uno.

## Limites

- Los limites de servicio son bounded contexts del negocio, no capas tecnicas.
- Cada servicio posee sus datos; acceso cruzado via API o eventos, jamas directo a la DB ajena.
- Contratos entre servicios versionados y compatibles (skill `contratos-api`); un cambio rompedor pasa por version nueva.

## Comunicacion

- Sincronica (REST/gRPC) para lectura y flujo de usuario donde se necesita respuesta inmediata; con timeouts, retries limitados y circuit breaker.
- Asincronica (eventos/cola) para desacoplar: publicado-consumido, at-least-once, y el consumidor **idempotente** por diseño.
- Outbox: eventos de negocio se publican en la misma transaccion de la DB (tabla outbox + relay); nunca "commit DB y luego publish".

## Consistencia

- Transaccion distribuida directa no existe: usa Saga (coreografia para flujos simples, orquestacion si el flujo tiene mas de 3 pasos).
- Consistencia eventual es el default entre servicios; el frontend y el diseño lo deben tolerar (estados intermedios, reintentos).
- Idempotencia: toda operacion de escritura remota acepta repetirse sin efecto duplicado (id de idempotencia).

## CQRS y Event Sourcing

- CQRS: separar escritura/lectura solo cuando los modelos divergen de verdad (lecturas pesadas con agregacion); no por moda.
- Event Sourcing solo con necesidad real de auditoria/replay completo; su costo (versionado de eventos, proyecciones) es alto.

## Operacion

- `traceId` propaga en toda llamada entre servicios (skill `convenciones-backend`); sin el, un flujo distribuido es indepurable (skill `observabilidad`).
- Fallas de red son el caso normal, no la excepcion: toda integracion define timeout, retry y que pasa cuando no responde.
