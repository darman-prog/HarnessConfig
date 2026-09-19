---
name: performance
description: Optimizacion de rendimiento con medicion primero: profiling, caching, queries, bundle frontend. Usar al optimizar codigo lento, reducir tamano de bundle, corregir queries pesadas o definir presupuestos de rendimiento. No cubre infraestructura de escalado: para eso esta infraestructura.
---

# Performance

## Medir primero, siempre

- Sin medicion no hay optimizacion: perfila el hotspot real (profiler del navegador, APM, `EXPLAIN ANALYZE` en DB) antes de cambiar codigo.
- Optimiza lo medido, no lo hipotetico; el micro-optimismo sin dato es deuda técnica.
- Todo cambio de rendimiento se verifica con benchmark antes/despues en el reporte (skill `testing`).

## Backend

- Queries: mata N+1 (eager loading o batch), usa indices donde el planner los use, pagina siempre listados (skill `base-datos`).
- Cache: solo para datos costosos y de baja volatilidad; define invalidacion explicita; nunca cachees datos por usuario en cache compartida.
- Operaciones pesadas (email, reportes, archivos) van a cola/tarea diferida, no en el request.

## Frontend

- Bundle: code splitting por ruta, lazy loading de modulos pesados, import solo de lo usado (tree-shaking real).
- Imagenes: formatos modernos, tamano responsivo, lazy loading nativo; fuentes con `font-display` y subsets.
- Rendering: evita re-renders en cascada (memoizacion con criterio, virtualizacion de listas largas).
- Presupuesto: define presupuesto de tamano/latencia por pagina y vigilalo en el pipeline.

## Reglas

- Las mejoras no degradan correccion: tests del repo en verde tras cada cambio.
- El agente `quality` ejecuta refactors de performance delegados; los hallazgos reportalos con dato, no con intuicion.

No incluye tutoriales de herramientas de profiling; usa el del stack. Para escalar infra (replicas, cache server-side, CDN) usa `infraestructura`.
