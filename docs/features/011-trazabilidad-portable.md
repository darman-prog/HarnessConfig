---
id: 011
status: cerrada
area: harness
tarea: B-001
created: 2026-10-22
updated: 2026-10-22
---
# Feature 011 — Trazabilidad portable y auditoria

> Backlog, expedientes con evidencia mecanica y registro, portable a todos los proyectos.

## Objetivo
Que cualquier persona pueda saber que falta, en que va cada trabajo, como comprobarlo y como deshacerlo leyendo un archivo, sin leer codigo.

## Contexto
El DDR registraba al cerrar y solo lo multi-sesion: el trabajo de una sesion no dejaba rastro mientras se hacia. Ademas, la evidencia era prosa autodeclarada, lo que invita a errores. La herramienta vive en la skill `documentacion`, viaja con `sync-global` y cada proyecto guarda solo sus datos.

## Alcance
| Incluye | Excluye |
|---|---|
| Backlog, expedientes, evidencia por criterio, adopcion y checks | Interfaces graficas y sincronizacion con herramientas externas |

## Criterios de aceptación
| N.º | Criterio verificable | Comando | Evidencia |
|---|---|---|---|
| 1 | Tests del CLI en verde | python -B -m unittest discover -s scripts/tests | |
| 2 | Guardarrail sin violaciones | powershell -NoProfile -ExecutionPolicy Bypass -File scripts/harness-budget.ps1 | |
| 3 | Backlog, expedientes e indice coherentes | python .opencode/skills/documentacion/scripts/trace.py --repo . check | |
| 4 | Verificacion completa (identidad y smokes) | powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 | |
| 5 | Global sincronizado y con identidad | powershell -NoProfile -ExecutionPolicy Bypass -File sync-global.ps1 -ForcePurge | |

## Pasos
1. Contrato y plantillas crudas.
2. CLI y tests.
3. Wrapper de `new-feature.ps1`.
4. Doctrina, agentes y onboarding.
5. Docs del flujo, router y registro.
6. Guardarrail, adopcion y ADR-004.

## Bitácora
| Criterio | Fecha | Comando | Exit | Commit |
|---|---|---|---|---|
| 5 | 2026-10-22 | powershell -NoProfile -ExecutionPolicy Bypass -File sync-global.ps1 -ForcePurge | 0 | a910385 |
| 1 | 2026-10-22 | python -B -m unittest discover -s scripts/tests | 0 | a910385 |
| 2 | 2026-10-22 | powershell -NoProfile -ExecutionPolicy Bypass -File scripts/harness-budget.ps1 | 0 | a910385 |
| 3 | 2026-10-22 | python .opencode/skills/documentacion/scripts/trace.py --repo . check | 0 | a910385 |
| 4 | 2026-10-22 | powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 | 0 | a910385 |

## Rollback
`git revert` de los commits de la feature y borrar `docs/features/BACKLOG.md`, `011-*.md` y la columna `Área` del índice.

## Cierre
- Fila resumen del changelog (2026-10-22).
- Decisión de arquitectura: ADR-004.
- Evidencia ejecutada sobre el árbol de trabajo previo al commit de la feature (SHA base `a910385`); el commit siguiente contiene el código verificado.
