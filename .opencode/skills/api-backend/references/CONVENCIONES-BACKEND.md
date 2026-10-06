# Convenciones backend ampliadas

Referencia bajo demanda para contrato observable y flujos backend. Complementa `api-backend`, `seguridad` y `base-datos`; no los reemplaza.

## Contrato observable

Define entradas, salidas, errores, auth, exposición de datos, idempotencia, paginación, orden, filtros y compatibilidad antes de cambiar una frontera. Mantén un orden determinista y un cursor estable o documenta las limitaciones del offset. No expongas excepciones, consultas, secretos ni detalles internos.

## Datos y efectos

Separa despliegue de esquema, backfill y retirada cuando no sea seguro hacerlo junto. Haz backfills reanudables, observables e idempotentes; verifica conteos e invariantes. La transacción cubre escrituras que deben confirmarse juntas, no red, correo o archivos lentos. Define concurrencia, reintentos y compensación cuando haya efectos externos.

## Auth, uploads y webhooks

- Elige sesión, JWT o token opaco por clientes, revocación y exposición; rota refresh tokens y limita su duración.
- En uploads valida magic bytes y tamaño, usa nombres no controlados por el usuario, temporales limpiables, streaming y cuarentena cuando el riesgo lo exija.
- En webhooks verifica firma antes de procesar, registra el evento, responde rápido, procesa diferido y garantiza idempotencia con reintentos acotados.

## Tiempo real (WebSocket y SSE)

- El canal es parte del contrato: mismo versionado, mismo shape de error que el resto de la API y mismo `traceId` que el request inicial.
- Autentica en el handshake y revalida autorizacion por suscripcion: un canal abierto no hereda permisos para siempre. Aisla a cada cliente a sus propios recursos.
- Heartbeat (ping/pong) cada N segundos y deteccion de conexion muerta; sin el no distingues cliente lento de cliente caido.
- Reconexion con backoff exponencial y jitter en el cliente; el servidor no debe asumir que la conexion vive.
- Backpressure: si el consumidor no sigue el ritmo, descarta, resume o corta; no acumules mensajes sin limite en memoria.
- Escala horizontal: el estado de salas y suscriptores vive en un broker (Redis u otro), no en la memoria del proceso; el balanceador necesita sticky sessions o conexiones re-resolubles.
- Elige SSE cuando el flujo es solo servidor a cliente: mas simple, reconexion nativa y sin protocolo extra. WebSocket cuando el cliente tambien emite.

## Anti-patterns

Vigila N+1, controlador gordo, capas vacías, migraciones masivas no reanudables, reintentos no idempotentes, exceso de datos, falta de rate limiting y logs con secretos. Para amenazas y hardening carga `seguridad`; para esquema carga `base-datos`.

## Checklist de cierre

- [ ] Contrato y transición compatibles definidos.
- [ ] Paginación, consultas, índices y concurrencia revisados.
- [ ] Migración/backfill validable y rollback o compensación documentados.
- [ ] Efectos externos fuera de transacciones o con estrategia explícita.
- [ ] Auth, autorización, validación, exposición y límites revisados.
- [ ] Pruebas cubren fronteras y riesgos sin duplicación innecesaria.
