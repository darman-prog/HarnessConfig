# Auditoría de complementación de skills (backend)

> **Para qué:** qué áreas del desarrollo backend no tienen skill dueña hoy, con evidencia verificable y dueño asignado.
> **Cuándo leerla:** antes de tocar skills de backend, al planear una remediación, o al evaluar si el harness cubre un tema nuevo.
> **Fecha:** 2026-10-06 · **Estado:** vigente (el informe no edita skills) · **Método:** lectura de las 36 skills del harness (excluye vendor) y búsqueda de evidencia en `~/Downloads/ProyectosSoftware`.

## 1. Resumen

De 8 áreas auditadas: **4 no tenían dueño** (DNS, TLS, realtime, protección de datos), **3 estaban parciales** (topología de red, caching, jobs) y **1 ya estaba cubierta** (CI/CD, lo que refutó el diagnóstico inicial).

El hueco más grave no era documental: `seguridad` **no mencionaba hashing de contraseñas**, así que un agente que construyera auth no tenía regla que seguir, y 4 proyectos tienen auth real.

**Remediación ejecutada el 2026-10-06:** los 7 huecos se cerraron en 8 commits (7 de remediación y 1 de corrección de codificación). Presupuesto final: **37 skills** y `AGENTS.md` 69/70.

## 2. Cobertura actual

| Área | Dueño | Evidencia | Veredicto |
| --- | --- | --- | --- |
| DNS y resolución | `infraestructura` | Sección "Red, DNS y topología": registros, TTL, SPF/DKIM/DMARC, wildcard y split-horizon | **Cubierto** (remediado) |
| TLS y certificados | `infraestructura` + `seguridad` | Infra: terminación en el borde, dueño y rotación. Seguridad: HSTS, TLS 1.2+, `SECURE_*` y header de proxy | **Cubierto** (remediado) |
| Realtime cliente↔servidor | `api-backend` + `infraestructura` | Referencia "Tiempo real": auth de canal, heartbeat, reconexión con backoff, backpressure, SSE vs WebSocket. Infra: sticky sessions y broker | **Cubierto** (remediado) |
| Protección de datos | `proteccion-datos` + `seguridad` | Skill nueva: bcrypt/argon, cifrado, PII, retención, anonimización, derecho al olvido y bitácora. `seguridad` apunta y exige hashing | **Cubierto** (remediado) |
| Topología de servicio | `infraestructura` | Sección "Red, DNS y topología": gateway como punto único, balanceador con health check, discovery sin IPs fijas | **Cubierto** (remediado) |
| Caching | `infraestructura` | Sección "Cache y CDN": borde, invalidación, ETag y partición por usuario. Puntero de `performance` corregido | **Cubierto** (remediado) |
| Jobs y colas | `api-backend` | Sección "Trabajo en segundo plano": worker aparte, backoff, DLQ con alerta, idempotencia y cron sin solape | **Cubierto** (remediado) |
| CI/CD y entornos | `despliegue` | `despliegue/SKILL.md:10-12,16-18,23`: pipeline con lint y tests, ambientes, secretos y rollback | Cubierto (sin cambio) |

**Matiz sobre CI/CD:** el diagnóstico inicial asumía que faltaba canary/blue-green/feature flags. `despliegue` ya posee el eje con 3+ reglas accionables, así que se cierra como cubierto; las estrategias progresivas entran solo cuando exista un pipeline real (hoy 0 `.github/workflows` y 0 `Dockerfile` en todos los proyectos).

## 3. Impacto real en proyectos

Sin esta tabla, "no cubierto" sería teoría. Hay impacto en 6 proyectos:

| Área | Proyecto | Evidencia | ¿Impacto? |
| --- | --- | --- | --- |
| DNS | RateClash | `frontend/src/environments/environment.prod.ts:4` (`wss://api.rateclash.com`) | **Sí** |
| DNS | Scrumter | `.env.example:43,51` (Brevo y `scrumter.io`) | **Sí** |
| DNS | atlas-magico | `netlify.toml:1-3` | **Sí** |
| DNS | Systematic | `docs/project-brain/OPERATIONS.md:25` | **Sí** |
| TLS | MetaBolic | `Backend/config/settings.py:94-101` (HSTS y SSL ya definidos) | **Sí** |
| TLS | RateClash | `backend/config/settings.py:100-147` sin ningún `SECURE_*` | **Sí** |
| TLS | Scrumter | `config/session.php:172` | **Sí** |
| Realtime | RateClash | `backend/config/asgi.py:7,16`; `movies/consumers.py:3-8`; `comment-socket.service.ts:11,58` | **Sí** |
| Realtime | Scrumter | `.env.example:30` (`BROADCAST_CONNECTION=log`, planeado) | **Sí** |
| Datos | Nydo | `demo-users.seed.ts:1`, `users.ts:10` (argon2id) | **Sí** |
| Datos | Scrumter | `RegisteredUserController.php:42`, `.env.example:15` (bcrypt 12) | **Sí** |
| Datos | MetaBolic | `accounts/models.py:45` (PII de avatar), `settings_test.py:16-18` | **Sí** |
| Datos | Systematic | `firestore.rules:5` | **Sí** |
| Topología | MetaBolic | `settings.py:17,49-52` | **Sí** |
| Topología | RateClash | `settings.py:12,138-139`, `.env.example:28-29` (proxy hops) | **Sí** |
| Caching | Nydo | `README.md:26`, `.env.example:4-5` (Redis) | **Sí** |
| Caching | Scrumter | `.env.example:34`; `ScrumterLandingPage/netlify.toml:16,22` | **Sí** |
| Caching | RateClash | `movies/views.py:36,118`, `settings.py:117-119` | **Sí** |
| Jobs | Nydo | `outbox-events.ts:8-10` (worker y DLQ con BullMQ) | **Sí** |
| Jobs | Scrumter | `.env.example:32` (`QUEUE_CONNECTION=database`) | **Sí** |
| Jobs | RateClash | `movies/views.py:113-118` (trabajo pesado dentro del request) | **Sí** |
| CI/CD | Systematic, Nydo, atlas-magico, Scrumter | `README.md:45-53` (Vercel + rollback), `netlify.toml` | **Sí** |

**Sin impacto en las 8 áreas:** `JaguarBurgers`, `FastCode` y `Capataz`.

## 4. Dueño asignado por hueco

La asignación respeta la frontera declarada de cada skill (su `description` y su autolimitación explícita) y la fuente única por regla.

| Área | Dueño | Justificación | Líneas |
| --- | --- | --- | --- |
| DNS | `infraestructura` | El registro de dominio es operación de borde, no código. Suma trigger en su `description` | +4 |
| TLS | `infraestructura` (+2) y `seguridad` (+2) | La terminación en ingress es alcance de infra; HSTS, redirect y `SECURE_*` son control de seguridad. MetaBolic ya lo prueba en `settings.py:94-101` | +4 |
| Realtime | `api-backend` (+4-6 en su reference) y `infraestructura` (+1) | Ya posee el contrato observable, `traceId` y timeouts. `microservicios` queda fuera: su `description` declara comunicación entre apps, no hacia el navegador. Infra suma sticky sessions | +5-7 |
| Datos | **`proteccion-datos` (nueva)** y `seguridad` (+2) | Cumplimiento es otro eje con otro disparador (legal o PRD, no vulnerabilidad). Meterlo en `seguridad` diluiría su trigger sin ganar cobertura. `seguridad` solo suma el puntero y el hashing obligatorio | +40-50 y +2 |
| Topología | `infraestructura` | Reverse proxy, balanceador, gateway y discovery ya son su alcance; la segmentación existe en `:36` | +3 |
| Caching | `infraestructura` | `performance/SKILL.md:3` se autolimita a "no cubre infraestructura de escalado"; crear skill nueva duplicaría el canon | +3-4 |
| Jobs | `api-backend` | `microservicios/SKILL.md:3` excluye monolitos y 3 de tus proyectos lo son; el trabajo en background pertenece al contrato del backend | +4 |
| CI/CD | — | Sin cambio: `despliegue` ya lo cubre | 0 |

**Ejecutado el 2026-10-06.** Cada fila de la tabla anterior se cerró en su propio commit, en el orden por riesgo acordado.

| Skill | Antes | Después | Tope |
| --- | --- | --- | --- |
| `infraestructura` | 43 | 63 | 65 |
| `api-backend` | 40 | 48 | 65 |
| `seguridad` | 37 | 42 | 65 |
| `proteccion-datos` | — | 39 | 65 |
| Total de skills | 36 | **37** | — |
| `AGENTS.md` | 67 | 69 | 70 |

Aviso de presupuesto: `infraestructura` quedó en 63/65, así que la próxima regla que se le añada exige recortar otra o mover detalle a una referencia.

## 5. Los 3 huecos más graves

1. **Protección de datos — riesgo alto.** `seguridad/SKILL.md` (37 líneas) no menciona bcrypt, argon, `PASSWORD_HASHERS`, cifrado ni retención: grep de `bcrypt|argon|hash|password|PASSWORD` = 0 coincidencias. Cuatro proyectos con auth real quedan sin instrucción de hashing.
2. **Realtime — riesgo alto.** RateClash ya opera con `wss://api.rateclash.com` y su `CHANNEL_LAYERS` usa `InMemoryChannelLayer` (`settings.py:117`) con una nota que dice "Production: swap … for RedisChannelLayer" (`:119`). Sin reglas de auth de canal, aislamiento, heartbeat ni reconexión, un segundo worker rompe los eventos en silencio.
3. **TLS — riesgo medio.** RateClash no define ningún `SECURE_*` mientras MetaBolic sí (`settings.py:94-101`). La inconsistencia es real y ninguna skill la detecta. Correlacionado: el DNS de correo (Brevo) no tiene SPF/DKIM/DMARC trazable en repo.

## 6. Hallazgos extra

| Hallazgo | Estado | Evidencia |
| --- | --- | --- |
| Puntero roto de `performance` a `infraestructura` | **Confirmado y corregido** | `performance/SKILL.md:32` delega "réplicas, caché server-side, CDN" a `infraestructura`, cuya única mención de cache es la de build de Docker (`infraestructura/SKILL.md:11`). Ahora apunta a la sección "Cache y CDN" |
| Drift repo ↔ global | **Refutado hoy** | Comparación recursiva de las 36 skills (MD5): 0 diferencias, 0 solo-local, 0 solo-global. Puede reincidir si se edita sin `sync-global.ps1` |
| Agujero de hashing en `seguridad` | **Confirmado** | Sin coincidencias de bcrypt, argon, `PASSWORD_HASHERS`, cifrado ni retención |

## 7. Plan de remediación

**Ejecutado el 2026-10-06** en 8 commits, en el orden por riesgo: datos → realtime → TLS → DNS → topología → caching → jobs, más un commit previo de corrección de codificación (mojibake introducido al reemplazar referencias en los archivos del harness).

Cada commit pasó el guardarraíl (exit 0) y los probes de trigger crecieron de 16 a 21. Cierre pendiente: `sync-global.ps1 -ForcePurge` y reinicio de la TUI.

## 8. Mantenimiento

- Este informe **no modifica skills**: solo registra cobertura, impacto y dueño.
- Al ejecutar la remediación, actualizar la columna "Dueño" de §2 y anotar el cierre en `changelog.md`.
- Si aparece un tema nuevo (GraphQL, feature flags, colas gestionadas), entra por la misma rúbrica de §2 antes de proponer skill.
