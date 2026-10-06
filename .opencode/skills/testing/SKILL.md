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
- **Orden de invocación de tests**: (1) filtro de RTK si existe para tu runner — `rtk vitest run`, `rtk playwright test`, `rtk pytest tests -q`, `rtk jest`; (2) runner directo — `npx vitest run`; (3) script del package manager — `npm test` — solo si fija env vars, flags o configuración que no puedas replicar en la línea directa.
- **Por qué el orden importa** (medido en la máquina del usuario, oct-2026, alcance global entre proyectos):

  | Invocación | Ahorro |
  | --- | --- |
  | `rtk playwright test` | 93,5% y 88,5% |
  | `rtk vitest run` (23 corridas) | 83,9% |
  | `rtk lint eslint` | 64,3% |
  | `rtk pytest tests -q` | 38,7% |
  | `npm run e2e` (el mismo e2e) | 0,8% |
  | `npm run build` | 0,6% |

  El script npm oculta qué ejecuta por dentro, así que RTK no activa su filtro: 100× de diferencia sobre la misma salida. `docker` y `kubectl` tienen filtro disponible, sin medición en esta máquina aún.
- **La salida de test se repaga en cada turno**: entra al contexto y se vuelve a enviar en los turnos siguientes. El runner directo es ademas lo que el harness comprime automaticamente cuando tiene RTK activo; un script generico como `npm test` no se comprime.
- **Si la salida viene condensada** (RTK activo: `PASS (n) FAIL (m)`, fallos nombrados y el hint `[full output: rtk recall <hash>]`), no la tomes por completa: si no identifica que fallo y por que, recupera el detalle con `rtk recall <hash>`. Si el recall no esta disponible o no alcanza, reejecuta por el script del package manager (`npm test`), que el harness no comprime y devuelve la salida cruda.

## TDD y performance

- TDD (red-green-refactor) para logica de negocio compleja y contratos; metodologia paso a paso en skill `tdd`. No es obligatorio para UI visual ni spikes de exploracion.
- Cambios de rendimiento se verifican con benchmark antes/despues del cambio (skill `performance`); sin medicion, no hay test de performance.
- Mocking: `stub` para datos fijos, `mock` para verificar interaccion de contrato, `spy` para observar sin reemplazar. No mockees lo que no te pertenece (librerias de terceros); envuelvelas en un adapter propio.

## Stack de referencia

- Angular: unitario con TestBed/Karma o Vitest, integracion con HttpClientTestingModule; E2E con Playwright o Cypress si el proyecto lo tiene.
- Django/DRF: unitario con `TestCase`, integracion con test client y DB de test; E2E opcional.
- Java/Spring Boot: unitario con JUnit + Mockito, integracion con Spring Boot Test, E2E con Testcontainers si aplica.

No incluye tutoriales de herramientas; usa el conocimiento interno del framework. Esta skill define la estrategia y convenciones del proyecto.