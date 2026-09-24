---
name: arquitectura
description: Clean Architecture y Dependency Rule, SOLID y DDD: capas domain/application/adapters/infrastructure. Usar al disenar features, ubicar codigo en capas, cambiar limites de dominio o elegir patron (pool de conexiones, proxy).
---

# Arquitectura

Usa cuatro capas: `domain`, `application`, `adapters` e `infrastructure`.

- `domain` contiene reglas de negocio, entidades, value objects y puertos. No conoce frameworks, ORM, HTTP ni bases de datos.
- `application` contiene casos de uso y orquesta puertos del dominio.
- `adapters` contiene controllers, presenters, DTOs y mapeadores.
- `infrastructure` implementa persistencia, clientes externos, configuracion y framework wiring.

La Dependency Rule apunta hacia adentro. Las interfaces se declaran en una capa interior y sus implementaciones en una capa exterior.

Al revisar o crear codigo, valida la ubicacion de cada responsabilidad, evita logica de negocio en controllers o modelos ORM y registra decisiones estructurales en `docs/adr/` cuando afecten limites o dependencias.

## Principios SOLID (resumen aplicable)

- SRP: una clase/modulo, una razon de cambio. Si describes el modulo con "y", divide.
- OCP: extiende con nuevos implementadores de puertos, no editando casos de uso existentes.
- LSP: cualquier implementacion de un puerto es intercambiable sin romper clientes.
- ISP: puertos pequenos y especificos; no interfaces de 10 metodos que la mitad se ignoran.
- DIP: ya lo cubre la Dependency Rule; las capas internas declaran, las externas implementan.

## DDD tactico (vocabulary comun)

- Entidades con identidad; value objects inmutables sin identidad; agregados como frontera de consistencia.
- Un agregado por transaccion; referencias entre agregados por id, no por objeto.
- Bounded contexts para delimitar dominios grandes; el lenguaje del contexto es el del negocio.
- Sistemas distribuidos (multiples servicios): ver skill `microservicios` antes de dividir.

## Patrones de diseno (ubicacion y limite)

- Tabla de 8 patrones (Factory, Builder, Specification, Strategy, Singleton, Prototype, Pool, Proxy) con "donde vive / cuando SI / cuando NO": [PATRONES.md](references/PATRONES.md).
- Modulo complejo (I/O + estado compartido + recurso escaso + coste + multi-tenant + 2+ integraciones): propon el patron con su porque y espera OK; con menos de 2 senales o sin ganancia clara, no hay patron.
- Entre servicios (Circuit Breaker, Retry, Outbox, Saga, CQRS): skill `microservicios`. Convenciones de codigo: `convenciones-backend`.
