---
name: debugging
description: Metodologia de debugging hasta la causa raiz: reproducir, aislar, rastrear, 5 porques, fix minimo y test de regresion; logging estructurado y troubleshooting por capas. Usar al diagnosticar bugs no triviales, bugs intermitentes o cuando el fix obvio no funciona. Para bugs triviales, build los corrige directo.
---

# Debugging

## Metodologia

1. **Reproduce** de forma determinista: test que falla o pasos exactos. Un bug que no se reproduce no se arregla, se estudia.
2. **Aisla**: caso minimo que reproduce el problema; delimita capa (HTTP, application, dominio, DB) y componente (skill `arquitectura`).
3. **Rastrea**: sigue el dato real, no el supuesto: logs, debugger, red, DB. Cambia una variable a la vez.
4. **Diagnostica**: causa raiz con 5 porques; para cuando el "porque" ya no es accionable o llega a decision de diseño.
5. **Fix minimo**: corrige la causa, no el sintoma; sin refactors de paso (skill `refactoring`).
6. **Regresion**: test que reproduce el bug y ahora pasa (skill `testing`).
7. **Verifica**: suite del repo completa; el fix no rompe vecinos.

## Logging estructurado (para rastrear)

- Niveles: `error` (requiere accion), `warn` (degradacion), `info` (eventos de negocio), `debug` (solo diagnostico activo).
- Formato JSON con `traceId` y contexto minimo; jamas tokens, contrasenas ni payloads sensibles (skill `seguridad`).
- En produccion se rastrea con logs ya escritos, no agregando logs nuevos a ciegas (skill `observabilidad`).

## Troubleshooting por familia

- **Intermitente**: relojes/caching stale/race conditions/concurrencia; busca lo no determinista primero.
- **Solo en produccion**: diff de configuracion/ambientes/datos; reproduce con datos de test equivalentes.
- **Lentitud**: perfila antes de tocar (skill `performance`); lentitud es bug de rendimiento, no de logica.
- **Error 500 misterioso**: stack trace real + traceId en logs (skill `convenciones-backend`); nunca reconstruirlo de memoria.
- **Frontend/backend desalineados**: verifica el contrato con `contratos-api` antes de culpar a cualquiera.

## Anti-patrones

- Parchar sintoma (try/catch que traga, retry sin entender, valor hardcodeado del caso fallido).
- Guess-and-check: cambiar codigo a lo loco sin repro ni hipotesis.
- Log masivo temporal que llega a produccion; si toca agregar debug logging, sale con el fix.

El agente `debugger` ejecuta esta metodologia cuando se le delega; `build` la usa para bugs que diagnostica en el camino.
