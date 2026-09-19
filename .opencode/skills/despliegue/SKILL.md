---
name: despliegue
description: Despliegue: ambientes, variables de entorno, CI/CD, Docker, healthchecks y rollback. Usar al preparar deploys, pipelines o configuracion por ambientes.
---

# Despliegue

## Ambientes y configuracion

- Separar dev / staging / produccion; la configuracion entra por variables de entorno, nunca hardcodeada.
- Versionar `.env.example` con las claves necesarias y sin valores; `.env` jamas se versiona (regla de `.gitignore` en `AGENTS.md`).
- Secretos de produccion en un secret manager del proveedor, no en el repositorio ni en logs (skill `seguridad`).

## Pipeline (CI/CD)

- Antes de desplegar, el pipeline corre lint, typecheck y las suites de tests del repo (skill `workflow` para el flujo de git).
- Build reproducible: lockfile commiteado; si aplica, Dockerfile multi-stage con imagen minima.
- Las migraciones de base de datos corren antes de levantar la nueva version y son backward-compatible expand/contract (skill `base-datos`).

## Produccion

- Exponer un endpoint de healthcheck sin auth que reporte dependencias (DB, colas).
- Definir plan de rollback antes de cada deploy: version anterior disponible y migraciones reversibles.
- Logs estructurados con `traceId` (skill `convenciones-backend`), accesibles post-deploy.

## Post-deploy

- Verificar los flujos criticos en el ambiente destino; para eso esta el agente `tester`.
- Si algo falla: rollback primero, debug despues.

No incluye tutoriales de CI/CD, Docker ni proveedores; esta skill define convenciones del proyecto. Para Dockerfiles, compose, IaC y operacion de infra, usa `infraestructura`; esta skill cubre el pipeline, ambientes y rollback.