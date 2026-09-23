---
name: infraestructura
description: Infraestructura como codigo y operacion: Dockerfile, compose, IaC, k8s/terraform, backups y recovery. Usar al tocar Dockerfiles, compose o manifiestos de infra. No cubre deploy ni ambientes: usa `despliegue`.
---

# Infraestructura

## Infraestructura como codigo

- Todo lo operativo se versiona: Dockerfile, `docker-compose.yml`, manifiestos (k8s, terraform, helm) en el repo; jamas configuracion manual solo en el servidor.
- Dockerfile multi-stage: imagen final minima, usuario no-root, sin secretos ni cache de build innecesario (skill `seguridad`).
- Pin de versiones: imagenes base por digest o tag exacto (no `latest`), herramientas con version fija para builds reproducibles (skill `despliegue`).
- Un cambio de infraestructura es un commit revisable como cualquier otro: describe que cambia, por que y el rollback (skill `workflow`).

## Entorno local reproducible

- `docker-compose` como unica forma de levantar el stack local: app, DB, colas y dependencias con un comando; el README debe bastar para que otro dev arranque.
- Volúmenes para datos persistentes; nunca datos de DB en la capa de la imagen.
- Puertos expuestos solo los necesarios; variables de entorno por `.env.example` versionado y `.env` ignorado (skill `despliegue`).
- Seeds/mocks de datos iniciales reproducibles (skill `base-datos`); el entorno local nunca depende de servicios externos reales.

## Orquestacion y recursos

- Manifiestos por ambiente separados por overlay/override, no por copia manual.
- Requests/limits de CPU y memoria definidos para todo servicio; sin ellos no se despliega.
- Sondeo de salud por endpoint de healthcheck (skill `despliegue`) y restart policy explicita.

## Datos y continuidad

- Backups automaticos de DB con retencion definida y restauracion probada al menos una vez; un backup no probado no es un backup.
- Migraciones corren en su propio paso del arranque, nunca embebidas en el build de la imagen (skill `base-datos`).
- Logs y metricas salen a stdout/endpoint estandar; agregacion posterior (skill `despliegue` para `traceId`).

## Seguridad de infraestructura

- Puertos abiertos minimos; DB y colas no expuestas a internet.
- Imagenes y dependencias escaneadas por vulnerabilidades en el pipeline (skill `despliegue`); secretos jamas en variables de imagen ni en el compose versionado.

## Costos

- Cambios de recursos (instancias, replicas, storage) justificados con uso actual; proponer antes de aplicar si el impacto es >2x el actual.

No incluye tutoriales de Docker, k8s ni terraform; esta skill define convenciones del proyecto. Para el pipeline de CI/CD, ambientes y rollback usa `despliegue`.
