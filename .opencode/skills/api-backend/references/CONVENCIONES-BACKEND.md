# Convenciones backend ampliadas

Referencia bajo demanda para contrato observable y flujos backend. Complementa `api-backend`, `seguridad` y `base-datos`; no los reemplaza.

## Contrato observable

Define entradas, salidas, errores, auth, exposiciÃ³n de datos, idempotencia, paginaciÃ³n, orden, filtros y compatibilidad antes de cambiar una frontera. MantÃ©n un orden determinista y un cursor estable o documenta las limitaciones del offset. No expongas excepciones, consultas, secretos ni detalles internos.

## Datos y efectos

Separa despliegue de esquema, backfill y retirada cuando no sea seguro hacerlo junto. Haz backfills reanudables, observables e idempotentes; verifica conteos e invariantes. La transacciÃ³n cubre escrituras que deben confirmarse juntas, no red, correo o archivos lentos. Define concurrencia, reintentos y compensaciÃ³n cuando haya efectos externos.

## Auth, uploads y webhooks

- Elige sesiÃ³n, JWT o token opaco por clientes, revocaciÃ³n y exposiciÃ³n; rota refresh tokens y limita su duraciÃ³n.
- En uploads valida magic bytes y tamaÃ±o, usa nombres no controlados por el usuario, temporales limpiables, streaming y cuarentena cuando el riesgo lo exija.
- En webhooks verifica firma antes de procesar, registra el evento, responde rÃ¡pido, procesa diferido y garantiza idempotencia con reintentos acotados.

## Anti-patterns

Vigila N+1, controlador gordo, capas vacÃ­as, migraciones masivas no reanudables, reintentos no idempotentes, exceso de datos, falta de rate limiting y logs con secretos. Para amenazas y hardening carga `seguridad`; para esquema carga `base-datos`.

## Checklist de cierre

- [ ] Contrato y transiciÃ³n compatibles definidos.
- [ ] PaginaciÃ³n, consultas, Ã­ndices y concurrencia revisados.
- [ ] MigraciÃ³n/backfill validable y rollback o compensaciÃ³n documentados.
- [ ] Efectos externos fuera de transacciones o con estrategia explÃ­cita.
- [ ] Auth, autorizaciÃ³n, validaciÃ³n, exposiciÃ³n y lÃ­mites revisados.
- [ ] Pruebas cubren fronteras y riesgos sin duplicaciÃ³n innecesaria.
