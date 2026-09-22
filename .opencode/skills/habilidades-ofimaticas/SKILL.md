---
name: habilidades-ofimaticas
description: Reglas de tipografia, layout y diseno para generar Word, PDF, PowerPoint y HTML a PDF con calidad editorial. Solo bajo invocacion explicita del usuario (ofimatica).
---

# Habilidades Ofimaticas

> **Activacion manual exclusiva:** Esta skill NO se carga automaticamente. Solo se activa cuando el usuario la menciona explicitamente (`habilidades-ofimaticas`, `ofimatica`, `ofimaticas` o `/habilidades-ofimaticas`). `backend-expert` y `ui-ux` deben ignorarla salvo invocacion directa. No auto-activar por detectar `docx`/`pdf`/`pptx` en la tarea.

## Stack recomendado
- `.docx` simple/rapido: `python-docx` via `templates/generar-docx.py`
- `.docx` informe complejo (portada, indice, figuras, codigo): `informe-docx` (Node + `docx-js`) — ver `informe-docx/SKILL.md`
- `.pptx`: `python-pptx`
- `HTML->PDF`: `WeasyPrint` (preferido, CSS `@page`) o `Playwright/Puppeteer` (fidelidad Chrome)
- `PDF nativo` sin HTML: `reportlab` solo si no aplica HTML

## Enrutamiento DOCX (elige UNA ruta por documento)
| Tipo de documento | Ruta |
|---|---|
| Documento corto, nota, acta, documento rapido | `python-docx` (`templates/generar-docx.py`) |
| Informe tecnico/academico con portada, indice, figuras, tablas y codigo | `informe-docx` (kit `docx-js`) |
| Informe academico extenso con auditoria editorial | `informe-docx` (kit `docx-js`) |

- No cargues ni uses ambas rutas para el mismo documento.
- Cada ruta respeta su propio sistema visual: `python-docx` usa la paleta contextual
  (PALETTE); `informe-docx` usa sus temas internos. No los mezcles en un documento.
- Ambas rutas activacion manual exclusiva (ver regla de arriba).

## Regla anti-alucinacion (obligatoria)
- Para `HTML->PDF` COPIA `templates/reporte-print.html` y reemplaza solo `<main>`; no generes CSS print desde cero.
- Para `.docx` simple COPIA `templates/generar-docx.py`; para informe complejo parte de `informe-docx/references/ejemplo.js`; para `.pptx` COPIA `templates/generar-pptx.py`.
- Referencia siempre los tokens de `templates/README.md`.

## Tokens y paleta contextual
Templates usan CSS variables / constantes `PRIMARY, ACCENT, NEUTRAL_DARK, NEUTRAL_LIGHT`.

Antes de generar, el agente debe:
1. Inferir contexto del pedido.
2. Proponer 1 paleta con justificacion en 1 linea y pedir confirmacion. No generar sin aprobar paleta (salvo que el usuario ya dio colores de marca, que tienen prioridad).
- `corporativo/formal` -> `#1A56DB + #374151` (confianza, sobrio)
- `financiero/datos` -> `#0F2A44 + #0E9F6E` (solidez, lectura de tablas)
- `educativo/academico` -> `#0E7490 + #D97706` (claridad, enfasis)
- `creativo/marketing` -> `#7C3AED + #DB2777` (energia, contraste)
- `salud/minimal` -> `#047857 + #57534E` (calma, limpio)
Reemplaza solo `--primary/--accent` (HTML) o `PALETTE` (Python) tras confirmacion.

Tipografia base: `Inter, Helvetica, Arial, sans-serif`; cuerpo `11pt/14pt 400 1.5`, `H1 18-22pt 700`, `H2 14-16pt 600`, `H3 12pt 600`. Spacing `4/8`, radius `6px`. Papel `A4 vertical 20mm` por defecto; presentacion `16:9`.

## Word (.docx)
- Usa estilos con nombre (`Normal`, `Heading 1-3`, `Caption`, `Table Grid`), nunca formato directo suelto.
- Margenes `2.54cm`, interlineado `1.15`, viudas/huerfanas controladas, numeracion en pie.
- Tablas con `Light Grid Accent` + fila encabezado con `primary`; imagenes ancladas con `caption`.

## PDF via HTML (caso principal)
Todo HTML que ira a PDF debe ser `print-first`:
- CSS obligatorio: `@page { size: A4; margin: 20mm }`, `@media print`, unidades `mm/pt`, `page-break-inside: avoid` en `figure/table/section`.
- Header/footer via `@page` + `counter(page)` o `header` fijo print; contenido en `<main>`.
- HTML semantico, CSS autocontenido en `<style>` (sin CDN para WeasyPrint), tablas con `border-collapse`.
- Flujo: genera `.html` autocontenido -> convierte `weasyprint input.html output.pdf` o `playwright pdf` -> verifica paginacion.

## PowerPoint (.pptx)
- Master unico `16:9` (`13.33x7.5"`), margen `48px`, grid 12 col.
- Max `6 lineas / 6 palabras` por bullet, tipografia `>=24pt` cuerpo, `32-44pt` titulo, contraste AA.
- Paleta limitada `1 primario + 1 acento + 2 neutros`; usa layouts `title` y `content` del template, no slides en blanco desde cero.
- Jerarquia + whitespace; icono > texto largo; notas del orador para detalle.

## PDF nativo
Solo si HTML no aplica. Usa mismos tokens tipograficos y margenes que `reporte-print.html`.
