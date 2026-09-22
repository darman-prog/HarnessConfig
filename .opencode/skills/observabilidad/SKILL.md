---
name: observabilidad
description: Observabilidad: logs, metricas y trazas con traceId como hilo; SLI (latencia, errores, saturacion), alertas accionables y dashboards por flujo. Usar al instrumentar servicios, definir alertas o diagnosticar en produccion. No cubre backlogs de infra: para backups y DR usa infraestructura.
---

# Observabilidad

## Los tres pilares, con un hilo

- **Logs**: eventos discretos con contexto; JSON estructurado, niveles claros, sin PII ni secretos (skill `seguridad`, skill `debugging`).
- **Metricas**: numeros agregados en el tiempo; latencia p50/p95/p99, tasa de error, throughput y saturacion (CPU, memoria, colas).
- **Trazas**: el recorrido de una request entre capas y servicios; `traceId` se genera en el borde y propaga en toda llamada (skill `convenciones-backend`, skill `microservicios`).
- El `traceId` conecta los tres: del dashboard de metricas al log al trace, misma llave.

## Que instrumentar

- En el borde: middleware/interceptor genera `traceId`, mide duracion y registra outcome de cada request (skill `convenciones-backend`).
- Negocio: metricas de eventos de negocio (login, checkout, export) ademas de las tecnicas.
- Salidas externas: toda llamada a DB, API externa o cola registra duracion y estado; son la causa tipica de degradacion.

## Alertas

- Sintomaticas y accionables: alerta por efecto que sufre el usuario (p95 alto, tasa de error, cola acumulada), no por causa posible (CPU 70%).
- Toda alerta tiene runbook: que significa, primera revision y a quien escalar; sin runbook no se alerta.
- Silencia lo ruidoso una vez, con justificacion; un dashboard de alertas ignoradas no es observabilidad.

## Dashboards

- Uno por flujo de usuario critico (checkout, login, export), no por microservicio.
- Incluye estado de dependencias (DB, colas, externos) para distinguir "me rompi yo" de "me rompio otro".

## En el ciclo de desarrollo

- Feature con riesgo de rendimiento o integracion nueva incluye su instrumentacion en el mismo cambio (skill `performance` para la medicion).
- Diagnosticar en produccion empieza por trace/logs existentes; los hallazgos recurrentes se convierten en metricas.
