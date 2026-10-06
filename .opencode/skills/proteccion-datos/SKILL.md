---
name: proteccion-datos
description: Protección de datos y cumplimiento: hashing de contraseñas, cifrado en reposo y en tránsito, PII, retención, anonimización, derecho al olvido y bitácora de auditoría. Usar al tratar datos personales, diseñar auth o definir políticas de retención. No cubre controles OWASP: usa `seguridad`.
---

# Protección de datos

Qué hacer con los datos del usuario a lo largo de su ciclo de vida. Los controles de seguridad (OWASP, CORS, rate limiting) viven en `seguridad`; esta skill define la **política de datos**.

## Contraseñas

- Hash siempre con **bcrypt o argon2id**; nunca MD5, SHA-1, SHA-256 pelado ni cifrado reversible.
- Calibra el coste una vez por entorno y documéntalo; el coste sube con el hardware, no se deja en el mínimo.
- Compara con función de tiempo constante; nunca `==` sobre el hash.
- Las contraseñas no se loguean, no se devuelven en respuestas ni se guardan en claro en ninguna tabla, log o backup.
- Al cambiar o resetear, invalida las sesiones y tokens activos (skill `seguridad`).

## Datos personales (PII)

- Clasifica antes de guardar: PII directa (nombre, email, documento, teléfono, IP, geolocalización) y categoría especial (salud, biométricos, menores) que exige más cuidado.
- Minimiza: guarda solo los campos que la funcionalidad necesita hoy, no los que "podrían servir".
- Cifrado en tránsito siempre (TLS); en reposo para PII, credenciales, tokens y backups.
- Separa identificadores de contenido cuando sea viable: el dato sensible no comparte tabla con el dato público.
- Documentos de identidad e imágenes personales: nombre no predecible, acceso autorizado y nunca en rutas públicas (skill `api-backend`).

## Ciclo de vida

- Define retención por tipo de dato y borra al vencer con un job, no a mano (skill `api-backend`).
- Derecho al olvido: elimina o anonimiza en cascada, incluidos backups y derivados; documenta lo que no se puede borrar y por qué.
- Anonimiza o pseudonimiza para analítica y entornos de prueba: los seeds usan datos falsos, nunca un dump de producción.
- Registra el consentimiento (qué se aceptó, cuándo y con qué versión del aviso) cuando la norma lo exija.

## Bitácora de auditoría

- Registra accesos a datos sensibles y cambios de permisos con quién, cuándo y sobre qué; en un log aparte del técnico.
- La bitácora no guarda el dato en sí, solo la referencia y el evento; nunca secretos ni contraseñas.
- Consérvala el tiempo que exija la norma aplicable, aunque el dato original ya se haya borrado.

No sustituye asesoramiento legal: ante una duda regulatoria concreta (qué norma aplica, cuánto tiempo retener), pregunta al usuario antes de decidir.
