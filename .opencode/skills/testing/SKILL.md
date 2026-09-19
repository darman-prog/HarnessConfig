---
name: testing
description: Estrategia de testing: niveles unitario/integracion/E2E, que mockear, cobertura. Usar al escribir o revisar tests. No cubre Git; usa workflow.
---

# Testing

Estrategia de testing separada de las convenciones Git (ver skill `workflow`).

## Niveles

- **Unitario**: logica de dominio y casos de uso aislados. Sin red, sin base de datos, sin dependencias externas.
- **Integracion**: repositorios, servicios HTTP reales o mockeados, middleware e interceptores. Verifica contratos entre capas.
- **E2E**: flujos criticos del usuario end-to-end. Cantidad reducida, solo los flujos principales.

## Reglas

- Testea comportamiento, no implementacion: no asserts sobre llamadas internas que no sean contrato.
- Mockea en el borde: clientes HTTP, ORM, servicios externos y reloj/fecha. No mockees logica interna del dominio.
- Cada test de una capa no debe depender de otra: unitario sin DB, integracion con DB de test.
- Cobertura minima por defecto en capas de dominio y application; UI cubre flujos criticos, no cada componente.
- Nombres descriptivos: `describe`/`it` en el idioma del proyecto, reflejando el comportamiento esperado.
- Los tests corren junto al cambio; si un refactor rompe tests sin cambiar comportamiento, los tests estan acoplados a implementacion.

## TDD y performance

- TDD (red-green-refactor) para logica de negocio compleja y contratos; metodologia paso a paso en skill `tdd`. No es obligatorio para UI visual ni spikes de exploracion.
- Cambios de rendimiento se verifican con benchmark antes/despues del cambio (skill `performance`); sin medicion, no hay test de performance.
- Mocking: `stub` para datos fijos, `mock` para verificar interaccion de contrato, `spy` para observar sin reemplazar. No mockees lo que no te pertenece (librerias de terceros); envuelvelas en un adapter propio.

## Stack de referencia

- Angular: unitario con TestBed/Karma o Vitest, integracion con HttpClientTestingModule; E2E con Playwright o Cypress si el proyecto lo tiene.
- Django/DRF: unitario con `TestCase`, integracion con test client y DB de test; E2E opcional.
- Java/Spring Boot: unitario con JUnit + Mockito, integracion con Spring Boot Test, E2E con Testcontainers si aplica.

No incluye tutoriales de herramientas; usa el conocimiento interno del framework. Esta skill define la estrategia y convenciones del proyecto.