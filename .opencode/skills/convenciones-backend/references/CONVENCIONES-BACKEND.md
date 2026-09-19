# Convenciones backend ampliadas

Referencia bajo demanda para contrato observable y flujos backend. Complementa `convenciones-backend`, `seguridad`, `base-datos` y `contratos-api`; no los reemplaza.

## Contrato observable

Define entradas, salidas, errores, auth, exposición de datos, idempotencia, paginación, orden, filtros y compatibilidad antes de cambiar una frontera. Mantén un orden determinista y un cursor estable o documenta las limitaciones del offset. No expongas excepciones, consultas, secretos ni detalles internos.

## Datos y efectos

Separa despliegue de esquema, backfill y retirada cuando no sea seguro hacerlo junto. Haz backfills reanudables, observables e idempotentes; verifica conteos e invariantes. La transacción cubre escrituras que deben confirmarse juntas, no red, correo o archivos lentos. Define concurrencia, reintentos y compensación cuando haya efectos externos.

## Auth, uploads y webhooks

- Elige sesión, JWT o token opaco por clientes, revocación y exposición; rota refresh tokens y limita su duración.
- En uploads valida magic bytes y tamaño, usa nombres no controlados por el usuario, temporales limpiables, streaming y cuarentena cuando el riesgo lo exija.
- En webhooks verifica firma antes de procesar, registra el evento, responde rápido, procesa diferido y garantiza idempotencia con reintentos acotados.

## Anti-patterns

Vigila N+1, controlador gordo, capas vacías, migraciones masivas no reanudables, reintentos no idempotentes, exceso de datos, falta de rate limiting y logs con secretos. Para amenazas y hardening carga `seguridad`; para esquema carga `base-datos`.

## Checklist de cierre

- [ ] Contrato y transición compatibles definidos.
- [ ] Paginación, consultas, índices y concurrencia revisados.
- [ ] Migración/backfill validable y rollback o compensación documentados.
- [ ] Efectos externos fuera de transacciones o con estrategia explícita.
- [ ] Auth, autorización, validación, exposición y límites revisados.
- [ ] Pruebas cubren fronteras y riesgos sin duplicación innecesaria.
