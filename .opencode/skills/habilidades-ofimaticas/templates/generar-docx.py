"""
Template anti-alucinacion para .docx — COPIA este archivo, no generes desde cero.
Requiere: pip install python-docx
Uso: python generar-docx.py
Respeta tokens de SKILL.md: Inter/Helvetica, 11pt, 1.15, A4 20mm, estilos con nombre.
Paleta: agente reemplaza PALETTE segun propuesta contextual aprobada (ver SKILL.md).

Version 2.0:
  - hex_to_rgb con validacion de formato (#FFF, FFF, #FFFFFF, FFFFFF)
  - margenes A4 y distancia header/footer calculados en EMU correctos
  - validacion de columnas y fallback de estilo en add_table_styled
  - build(output_path) con manejo de errores al guardar
  - logging estructurado, type hints y docstrings
"""
from __future__ import annotations

import logging
import sys
from typing import List, Optional

from docx import Document
from docx.shared import Pt, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.table import Table

# ─────────────────────────────────────────────────────────────
# Configuracion de logging
# ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# PALETTE: agente reemplaza segun contexto
# (corporativo/financiero/educativo/creativo/salud)
# ─────────────────────────────────────────────────────────────
PALETTE = {
    "primary":       "1A56DB",   # corporativo/formal por defecto
    "accent":        "0E9F6E",
    "neutral_dark":  "111827",
    "neutral_light": "F3F4F6",
}

FONT_NAME = "Calibri"  # Inter no disponible en Word -> Calibri/Helvetica equivalente sans-serif

# ─────────────────────────────────────────────────────────────
# Utilidades
# ─────────────────────────────────────────────────────────────
def hex_to_rgb(hex_str: str) -> RGBColor:
    """Convierte hex a RGBColor con validacion robusta.

    Acepta formatos: #FFF, FFF, #FFFFFF, FFFFFF
    Lanza ValueError si el color es invalido.
    """
    if not isinstance(hex_str, str):
        raise TypeError(f"Color debe ser string, recibido: {type(hex_str).__name__}")

    h = hex_str.strip().lstrip("#")

    # Normalizar formato corto (#FFF -> #FFFFFF)
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)

    if len(h) != 6:
        raise ValueError(f"Color hex invalido (longitud {len(h)}): '{hex_str}'")

    if not all(c in '0123456789ABCDEFabcdef' for c in h):
        raise ValueError(f"Color hex contiene caracteres invalidos: '{hex_str}'")

    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def set_margins(section, mm: int = 20) -> None:
    """Configura margenes de seccion en milimetros.

    1mm = 36000 EMU exactamente (1 inch = 914400 EMU, 1 inch = 25.4mm)
    """
    emu_per_mm = 36000
    margin_emu = Emu(int(mm * emu_per_mm))

    section.top_margin = margin_emu
    section.bottom_margin = margin_emu
    section.left_margin = margin_emu
    section.right_margin = margin_emu

    # Header y footer a 12mm del borde
    header_footer_emu = Emu(int(12 * emu_per_mm))
    section.header_distance = header_footer_emu
    section.footer_distance = header_footer_emu


def add_page_number(run) -> None:
    """Inserta el campo PAGE dentro de un run existente.

    El campo va en el mismo run que contiene el texto "Pagina " para que Word
    lo renderice como una sola linea continua.
    """
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')

    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"

    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')

    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)


# ─────────────────────────────────────────────────────────────
# Estilos del documento
# ─────────────────────────────────────────────────────────────
def style_document(doc: Document) -> None:
    """Configura estilos base del documento."""

    # Normal
    s = doc.styles['Normal']
    s.font.name = FONT_NAME
    s.font.size = Pt(11)
    s.font.color.rgb = hex_to_rgb(PALETTE["neutral_dark"])
    pf = s.paragraph_format
    pf.space_after = Pt(6)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.15
    pf.widow_control = True

    # Heading 1
    h1 = doc.styles['Heading 1']
    h1.font.name = FONT_NAME
    h1.font.size = Pt(18)
    h1.font.bold = True
    h1.font.color.rgb = hex_to_rgb(PALETTE["neutral_dark"])
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)
    h1.paragraph_format.keep_with_next = True

    # Heading 2
    h2 = doc.styles['Heading 2']
    h2.font.name = FONT_NAME
    h2.font.size = Pt(14)
    h2.font.bold = True
    h2.font.color.rgb = hex_to_rgb(PALETTE["primary"])
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)

    # Heading 3
    h3 = doc.styles['Heading 3']
    h3.font.name = FONT_NAME
    h3.font.size = Pt(11)
    h3.font.bold = True
    h3.font.color.rgb = hex_to_rgb(PALETTE["neutral_dark"])

    # Caption (crear si no existe)
    if 'Caption' not in doc.styles:
        cap = doc.styles.add_style('Caption', 1)
    else:
        cap = doc.styles['Caption']
    cap.font.name = FONT_NAME
    cap.font.size = Pt(8)
    cap.font.color.rgb = hex_to_rgb("6B7280")
    cap.font.italic = True
    cap.paragraph_format.space_after = Pt(6)


# ─────────────────────────────────────────────────────────────
# Tablas
# ─────────────────────────────────────────────────────────────
def add_table_styled(
    doc: Document,
    headers: List[str],
    rows: List[List],
    caption: Optional[str] = None
) -> Table:
    """Crea tabla con estilo corporativo y validacion de dimensiones.

    Args:
        doc: Documento destino
        headers: Lista de encabezados
        rows: Lista de filas (cada fila es lista de valores)
        caption: Texto de caption opcional

    Raises:
        ValueError: Si las dimensiones de rows no coinciden con headers
    """
    # Validacion de dimensiones
    if not headers:
        raise ValueError("headers no puede estar vacio")

    for i, row in enumerate(rows):
        if len(row) != len(headers):
            raise ValueError(
                f"Fila {i} tiene {len(row)} columnas, "
                f"esperadas {len(headers)} (headers)"
            )

    table = doc.add_table(rows=1, cols=len(headers))

    # Intentar estilo corporativo con fallback
    try:
        table.style = 'Light Grid Accent 1'
    except KeyError:
        logger.warning("Estilo 'Light Grid Accent 1' no encontrado, usando fallback")
        try:
            table.style = 'Light Grid'
        except KeyError:
            logger.warning("Estilo 'Light Grid' no encontrado, usando estilo por defecto")

    table.autofit = True

    # Header
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = str(h)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = hex_to_rgb("FFFFFF")
                r.font.size = Pt(9)

        # Shading del header
        shading = OxmlElement('w:shd')
        shading.set(qn('w:fill'), PALETTE["primary"])
        shading.set(qn('w:val'), 'clear')
        cell._tc.get_or_add_tcPr().append(shading)

    # Rows
    for row_data in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row_data):
            cells[i].text = str(val)
            for p in cells[i].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)

    # Caption
    caption_text = caption or "Tabla 1 — Fuente: sistema interno."
    doc.add_paragraph(caption_text, style='Caption')

    return table


# ─────────────────────────────────────────────────────────────
# Build principal
# ─────────────────────────────────────────────────────────────
def build(output_path: str = 'reporte.docx') -> None:
    """Genera el documento completo.

    Args:
        output_path: Ruta de salida del archivo .docx
    """
    doc = Document()

    # ─── Configuracion de pagina A4 ────────────────────────
    section = doc.sections[0]
    section.page_height = Emu(int(297 * 36000))  # A4 alto
    section.page_width = Emu(int(210 * 36000))   # A4 ancho
    set_margins(section, mm=20)

    # ─── Estilos ────────────────────────────────────────────
    style_document(doc)

    # ─── Header ─────────────────────────────────────────────
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = hp.add_run("● TU MARCA / PROYECTO")
    run.font.size = Pt(8)
    run.font.color.rgb = hex_to_rgb(PALETTE["primary"])
    run.bold = True

    # ─── Footer con numeracion ──────────────────────────────
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Un solo run para "Pagina " + campo PAGE
    r = fp.add_run("Página ")
    r.font.size = Pt(8)
    r.font.color.rgb = hex_to_rgb("6B7280")
    add_page_number(r)  # El campo va en el MISMO run

    # Run separado para el texto confidencial
    conf = fp.add_run("  ·  Confidencial")
    conf.font.size = Pt(8)
    conf.font.color.rgb = hex_to_rgb("6B7280")

    # ─── Contenido ejemplo — REEMPLAZA desde aqui ──────────
    doc.add_heading('Título del Reporte — Máximo 2 líneas', level=1)

    p = doc.add_paragraph()
    r = p.add_run('Resumen ejecutivo en 2-3 líneas: qué contiene y qué decisión habilita.')
    r.font.size = Pt(11)
    r.font.color.rgb = hex_to_rgb("6B7280")
    r.italic = True

    doc.add_heading('1. Contexto y objetivo', level=2)
    doc.add_paragraph(
        'Describe problema, alcance y criterio de éxito. '
        'Párrafos cortos (3-4 líneas). Evita muros de texto.'
    )

    doc.add_heading('1.1 Alcance', level=3)
    doc.add_paragraph('Item 1 — concreto y verificable.', style='List Bullet')
    doc.add_paragraph('Item 2 — con número o fecha.', style='List Bullet')

    doc.add_heading('2. Resultados', level=2)
    add_table_styled(
        doc,
        headers=["#", "Concepto", "Valor", "Estado"],
        rows=[
            ["1", "Concepto A", "42.500", "✓ Cumple"],
            ["2", "Concepto B", "18.300", "En proceso"],
            ["3", "Concepto C", "9.720", "Observado"],
        ]
    )

    doc.add_heading('3. Conclusiones', level=2)
    doc.add_paragraph('Conclusión 1 con dato.', style='List Number')
    doc.add_paragraph('Conclusión 2 con implicancia.', style='List Number')

    # ─── Guardar ────────────────────────────────────────────
    try:
        doc.save(output_path)
        logger.info(f"OK -> {output_path} generado con estilos nombrados y margenes A4 20mm")
    except PermissionError:
        logger.error(f"No se pudo guardar {output_path}: archivo en uso o sin permisos")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error al guardar {output_path}: {e}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    build()
