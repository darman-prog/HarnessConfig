---
name: seguridad
description: Seguridad OWASP: auth (JWT, sesiones, RBAC), validacion, secretos, CORS, rate limiting. Usar al revisar auth, inputs, endpoints, cookies o integraciones externas.
---

# Seguridad

- Valida y autoriza siempre en backend; el frontend nunca es una frontera de seguridad.
- Mantiene secretos y credenciales fuera del repositorio, logs, respuestas y mensajes de error.
- Usa cookies `httpOnly`, `Secure` y `SameSite` para sesiones o tokens cuando el flujo lo permita, y protege CSRF donde corresponda.
- Configura CORS con allowlist explicita, no con comodines en produccion.
- Aplica rate limiting en autenticacion, endpoints sensibles y recursos costosos.
- Evita inyeccion usando consultas parametrizadas y validacion de entradas.
- No expone stack traces, identificadores internos innecesarios ni datos personales.
- Registra eventos de seguridad sin registrar tokens, contrasenas ni payloads sensibles.

## Autenticacion y sesiones

- La decision JWT vs sesiones de servidor se documenta una vez en el proyecto (ADR o `AGENTS.md`) y se respeta en todos los flujos.
- Con JWT: access token de vida corta + refresh token con rotacion; ambos en cookies `httpOnly` y `Secure`, nunca en localStorage (XSS).
- Autorizacion (RBAC/ABAC) verificada server-side en cada endpoint; el frontend solo oculta opciones, nunca autoriza.
- Cambiar o resetear la contrasena revoca sesiones y tokens activos.
- Definir expiracion y politica de renovacion por ambiente; ningun token vive para siempre.

## Seguridad en frontend

- CSP estricta con allowlist explicita; sin `unsafe-inline` salvo justificacion documentada.
- Nunca renderices input de usuario con `innerHTML`/`dangerouslySetInnerHTML` sin sanitizar; escapa por defecto.
- Dependencias frontend auditadas (`npm audit` o equivalente) en el pipeline; versiones congeladas en lockfile.
- El frontend valida para UX, no para seguridad; la validacion real vive en backend.

## Auditoria periodica

- Revisar OWASP Top 10 en cada feature que toque auth, inputs o integraciones externas.
- Cambios de dependencias con CVEs conocidos se bloquean; el agente `auditor` revisa seguridad en pre-merge.

En cada cambio sensible revisa autenticacion, autorizacion, control de acceso por objeto, validacion, almacenamiento de secretos y OWASP Top 10. Usa la sintaxis del framework mediante conocimiento interno; esta skill solo define controles.
