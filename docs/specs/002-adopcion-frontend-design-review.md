---
id: 002
status: implementada
created: 2026-09-21
updated: 2026-09-22
---

# Adopcion de frontend-design-review (Microsoft) para revision de UI

## Objetivo y alcance
Incorporar al harness un skill de revision estructurada de UI que no duplique `impeccable`: aporta formato y scoring (3 pilares), compliance de design system y evidencia. Incluye vendorizar el skill adaptado, su ruteo, la exencion de presupuesto y el registro en `Logs`.

No-objetivos: candidatas descartadas del catalogo (anthropics/frontend-design redundante, openai/frontend-skill inexistente, google-labs-code/design-md requiere Stitch MCP), MCP de Figma, y cambios en `impeccable`/`impecable`/`ui-ux` mas alla del puntero.

## Criterios de aceptacion
- `.opencode/skills/frontend-design-review/SKILL.md` con `description` ≤45 palabras, WCAG 2.2 AA (sin "WCAG 2.1") y **sin bloque de creacion creativa** (apunta a `impeccable`).
- Guardarrail en verde con la skill exenta por lineas (vendor ≤180).
- `AGENTS.md` ≤60 lineas con la skill ruteable y sin duplicar triggers.
- Regla anti-doble-review visible en el `SKILL.md`.
- `sync-global.ps1` exit 0 y skill disponible en el global tras reiniciar la TUI.

## Estado
Aprobada por el usuario (2026-09-21), implementada e smoke OK (2026-09-22).

## Evidencia
- Fuente: `github.com/microsoft/skills` → `.github/skills/frontend-design-review/` (licencia MIT). Descargado: `SKILL.md` 6.157 B + `references/{quick-checklist,review-output-format,review-type-modifiers,pattern-examples}.md` (6,7 KB en total).
- Catalogo de descubrimiento: `VoltAgent/awesome-agent-skills` (MIT; README 1.864 lineas, 1.146 links). Candidatos UI evaluados: `anthropics/frontend-design` (redundante con `impeccable`: shape/colorize/typeset/layout/animate/delight), `microsoft/frontend-design-review` (eje distinto), `openai/frontend-skill` (no existe en `openai/skills@main`; el link da 404), `google-labs-code/design-md` (redundante + depende de Stitch MCP).
- Baseline de coste: medicion F de `docs/specs/001` → los cuerpos de skill no dominan el coste; +1 `description` (~31 palabras) es ruido.

## Decisiones
- Confirmado por el usuario: adoptar **adaptada** (no tal cual).
- Adaptaciones locales aplicadas: `description` al presupuesto; WCAG 2.1 → **2.2 AA** canonico (skill `accesibilidad`); nota anti-doble-review; Figma/Storybook marcados como opcionales.
- Recorte confirmado por el usuario: se elimino el bloque "Creative Frontend Design" (tipografia/color/motion/composicion) porque duplicaba `impeccable`; la skill queda como **review puro** (SKILL.md final: 116 lineas) y la creacion se apunta a `impeccable`.
- Divergencia deliberada con upstream: se pierde la actualizacion automatica del pack; el mantenimiento pasa a ser manual.

## Tareas ordenadas (1 commit c/u)
1. Vendorizar y adaptar (`SKILL.md` + 4 `references`) — `feat:`.
2. Exencion en `scripts/harness-budget.ps1`, ruteo en `AGENTS.md` y puntero en `ui-ux` — `feat:`.
3. Registrar en `docs/harness/changelog.md` — `docs:`.

## Riesgos / edge cases
- Solape con `impeccable critique/audit` → mitigado con la regla anti-doble-review y ruteo como opcional.
- Skill vendor adaptada diverge del upstream → asumido; revisar a mano ante updates de Microsoft.
- Proyectos sin Figma/Storybook → se evalua contra tokens y componentes reales del repo.
- Coste fijo: +1 `description` en el system prompt de cada sesion (≈31 palabras).

## Cierre
Guardarrail + `sync-global.ps1` + reinicio de TUI; smoke manual: una tarea de review de UI debe declarar `frontend-design-review` junto a `ui-ux`.
Smoke ejecutado (2026-09-22): la review de una landing de venta de carros declaro ambas skills y produjo el veredicto estructurado de la skill (Needs work, 0 blocking, 3 mayores) sobre el formato de sus `references/`.

## Trazabilidad
Commits de vendorizacion, integracion (ruteo + guardarrail) y registro (spec + Logs); guardarrail en verde; smoke OK (2026-09-22).
