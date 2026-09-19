---
name: base-datos
description: Migraciones, rollback, naming de tablas/columnas, indices, FKs y seeds. Usar al tocar esquema, migraciones, modelos de persistencia o acceso a datos.
---

# Base de Datos

Convenciones de persistencia para cualquier motor (PostgreSQL, MySQL, SQLite, etc.). La sintaxis del ORM va con conocimiento interno; esta skill define reglas del proyecto.

## Migraciones

- Todo cambio de esquema vive en una migracion versionada y ordenada; nunca se modifica la base a mano.
- Una migracion ya aplicada en algun ambiente no se edita: se crea una migracion nueva que corrija o revierta.
- Cada migracion define su rollback (down) o documenta por que no es posible.
- Para produccion usa expand/contract: primero se agrega columna/tabla, se migran datos, y solo despues se elimina lo viejo (ver skill `despliegue`).

## Modelo y naming

- Tablas y columnas en `snake_case`, coherente con `convenciones-backend`; tablas en plural, columnas singulares descriptivos.
- Declara FKs e indices explicitamente en la migracion; no dependas de convenciones implicitas del ORM.
- Extrae relaciones n:m a tablas intermedias; justifica cada desnormalizacion.

## Datos

- Seeds separados de migraciones: las migraciones cambian esquema, los seeds pueblan ambientes de desarrollo.
- Antes de operaciones destructivas (drop, truncate, DELETE sin filtro) confirmar con el usuario y verificar que existe backup o rollback.
- Los tests usan DB de test, nunca la base real (skill `testing`).

No incluye tutoriales de SQL ni de ORMs; esta skill define convenciones del proyecto.