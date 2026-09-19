# Templates — habilidades-ofimaticas

Anti-alucinacion: COPIA el template, no generes desde cero. Solo reemplaza contenido y paleta.

| Archivo | Cuando copiar | Comando | Que cambiar |
|---------|---------------|---------|-------------|
| `reporte-print.html` | `html -> pdf`, informe, reporte imprimible | `weasyprint reporte-print.html reporte.pdf` o `playwright pdf` | `<main>` + `:root { --primary/--accent }` segun paleta aprobada |
| `generar-docx.py` | `.docx` simple / Word rapido | `pip install python-docx; python generar-docx.py` -> `reporte.docx` | `PALETTE` + bloque `# Contenido ejemplo — REEMPLAZA` |
| `generar-pptx.py` | `.pptx` / diapositivas | `pip install python-pptx; python generar-pptx.py` -> `presentacion.pptx` | `PALETTE` + `add_bullet_slide(...)` |
| `../informe-docx/references/ejemplo.js` | Informe Word complejo: portada, indice, figuras, codigo | copiar como `build.js` en carpeta temporal; `node build.js` (requiere paquete `docx` del harness global) | contenido + tema del kit (`institucional/sobrio/campo/academico`); anchos de tabla suman `contentWidth()` |

Enrutamiento DOCX: documento rapido -> `generar-docx.py`; informe tecnico/academico
complejo -> `informe-docx` (ver `../informe-docx/SKILL.md`). Nunca ambas para el mismo
documento.

## Paleta contextual (ver SKILL.md)
Agente propone 1 paleta segun contexto y pide confirmacion antes de generar. Variables:
- HTML: `:root { --primary: #...; --accent: #...; }`
- Python: `PALETTE = {"primary": "...", "accent": "..."}`

Heuristica: `corporativo #1A56DB`, `financiero #0F2A44/#0E9F6E`, `educativo #0E7490/#D97706`, `creativo #7C3AED/#DB2777`, `salud #047857`.

## Verificacion rapida
- HTML: abrir en Chrome -> Print Preview -> debe paginar A4 20mm con header/footer y tablas sin cortes.
- DOCX: abrir en Word -> estilos `Heading 1-3` deben existir, no formato directo.
- PPTX: `13.33x7.5` (16:9), margen 48px, texto >=18pt.
