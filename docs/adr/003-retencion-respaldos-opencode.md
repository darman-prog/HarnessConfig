# ADR-003 — Retención de respaldos de la base de OpenCode

**Fecha:** 2026-10-19
**Estado:** Activa
**Decisión:** los respaldos de `opencode.db` se guardan fuera del repo, consolidados con la API de backup de SQLite, sin tablas de credenciales, verificados con `integrity_check` y un escaneo de secretos; se cifran solo cuando el escaneo encuentra claves que no se pueden redactar.

## Contexto

`opencode.db` (SQLite en modo WAL) guarda el historial de sesiones, los mensajes y las credenciales de los proveedores. Las tablas `control_account` y `credential` contienen tokens en claro, y `auth.json`, en el mismo directorio, guarda las claves de los proveedores. Cualquier respaldo de esa base es, por tanto, una copia completa de datos personales y credenciales.

Al archivar ese archivo aparecen dos problemas operativos:

1. Copiar `opencode.db` como archivo pierde las transacciones que aún viven en el `-wal`. Un respaldo restaurado desde un `.db` sin su WAL queda incompleto sin avisar, y SQLite solo reconoce el sidecar si se llama `<archivo>-wal`.
2. Un `.db` suelto en la carpeta del usuario puede acabar en un servicio de sincronización, en un disco compartido o en una copia ajena al control del usuario, arrastrando tokens válidos.

El repo es público, así que el respaldo tampoco puede vivir dentro de él.

## Decisión

1. Los respaldos se guardan fuera del repo y fuera de carpetas sincronizadas.
2. Se generan con la API de backup de SQLite, no copiando archivos: el resultado es un único archivo autocontenido, con el WAL ya consolidado.
3. Antes de archivar se eliminan las tablas de credenciales y se redactan los valores con formato de secreto en las columnas de contenido; se conserva el nombre de la clave para no romper el JSON.
4. El archivo se da por bueno solo si pasa `PRAGMA integrity_check`, conserva los conteos de sesiones, mensajes y partes, y el escaneo de secretos no devuelve valores residuales.
5. Los originales con credenciales se borran únicamente después de verificar la copia limpia.
6. Si el escaneo encuentra claves que no se pueden redactar sin corromper el contenido, el archivo se cifra (7-Zip, AES-256, cabecera cifrada) en lugar de guardarse en claro.

## Consecuencias

- Positivas: el respaldo no arrastra credenciales; es un solo archivo, independiente de los nombres de los sidecars; se puede restaurar con cualquier versión que abra el esquema.
- Negativas: no es una copia byte a byte y los valores redactados se pierden (irrelevantes: se regeneran al iniciar sesión). El redactado es heurístico: detecta formatos conocidos de clave (`sk-`, `ghp_`, `AKIA`, `Bearer`, claves privadas PEM) y asignaciones `clave=valor`, pero no contraseñas arbitrarias dentro de texto libre.
- Residual: la base viva conserva las credenciales porque la aplicación las necesita; el riesgo se acota al disco local y no se traslada a los respaldos.
- Operativa: un respaldo sin verificación no cuenta como respaldo. El orden es siempre copiar, verificar y solo entonces borrar el original.

## Alternativas descartadas

- **Copiar el `.db` como archivo**: pierde las transacciones del WAL si el nombre del sidecar no coincide, y no avisa.
- **Guardar los respaldos en el repo**: el repo es público y los respaldos contienen datos personales.
- **Cifrar siempre con contraseña**: añade una dependencia y un secreto extra que custodiar; se reserva para cuando no se puede redactar.
- **No conservar respaldos**: impide recuperar historial si una migración de esquema falla.
- **Limpiar la base viva**: rompe las sesiones activas y obliga a reautenticar cada proveedor, sin ventaja frente a limpiar solo los respaldos.
