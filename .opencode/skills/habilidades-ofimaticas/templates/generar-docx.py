"""
Template anti-alucinacion para .docx — COPIA este archivo, no generes desde cero.
Requiere: pip install python-docx
Uso: python generar-docx.py
Respeta tokens de SKILL.md: Inter/Helvetica, 11pt, 1.15, A4 20mm, estilos con nombre.
Paleta: agente reemplaza PALETTE segun propuesta contextual aprobada (ver SKILL.md).
"""
from docx import Document
from docx.shared import Pt, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# === PALETTE: agente reemplaza segun contexto (corporativo/financiero/educativo/creativo/salud) ===
PALETTE = {
    "primary": "1A56DB",      # corporativo/formal por defecto
    "accent": "0E9F6E",
    "neutral_dark": "111827",
    "neutral_light": "F3F4F6",
}
FONT_NAME = "Calibri"  # Inter no disponible en Word -> Calibri/Helvetica equivalente sans-serif

def hex_to_rgb(hex_str):
    h = hex_str.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

def set_margins(section, mm=20):
    emu = Emu(int(mm * 36000))  # 1mm ~ 36000 EMU (aprox 2.54cm = 914400 EMU)
    # python-docx usa EMU exacto: 1 inch = 914400 EMU, 1mm = 36000
    section.top_margin = emu
    section.bottom_margin = emu
    section.left_margin = emu
    section.right_margin = emu
    section.header_distance = Emu(int(12 * 36000 / 2.54 * 0.5))  # ~12.7mm
    section.footer_distance = Emu(int(12 * 36000 / 2.54 * 0.5))

def add_page_number(run):
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

def style_document(doc):
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

def add_table_styled(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Light Grid Accent 1'
    table.autofit = True
    # Header
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = hex_to_rgb("FFFFFF")
                r.font.size = Pt(9)
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
    doc.add_paragraph('Tabla 1 — Fuente: sistema interno.', style='Caption')
    return table

def build():
    doc = Document()
    # A4
    section = doc.sections[0]
    section.page_height = Emu(int(297 * 36000))
    section.page_width = Emu(int(210 * 36000))
    set_margins(section, mm=20)
    style_document(doc)

    # Header
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = hp.add_run("● TU MARCA / PROYECTO")
    run.font.size = Pt(8)
    run.font.color.rgb = hex_to_rgb(PALETTE["primary"])
    run.bold = True

    # Footer con numeracion
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run()
    r.font.size = Pt(8)
    r.font.color.rgb = hex_to_rgb("6B7280")
    r.text = "Página "
    add_page_number(fp.add_run())
    fp.add_run("  ·  Confidencial").font.size = Pt(8)

    # Contenido ejemplo — REEMPLAZA desde aqui
    doc.add_heading('Título del Reporte — Máximo 2 líneas', level=1)
    p = doc.add_paragraph()
    r = p.add_run('Resumen ejecutivo en 2-3 líneas: qué contiene y qué decisión habilita.')
    r.font.size = Pt(11)
    r.font.color.rgb = hex_to_rgb("6B7280")
    r.italic = True

    doc.add_heading('1. Contexto y objetivo', level=2)
    doc.add_paragraph(
        'Describe problema, alcance y criterio de éxito. Párrafos cortos (3-4 líneas). Evita muros de texto.'
    )
    doc.add_heading('1.1 Alcance', level=3)
    doc.add_paragraph('Item 1 — concreto y verificable.', style='List Bullet')
    doc.add_paragraph('Item 2 — con número o fecha.', style='List Bullet')

    doc.add_heading('2. Resultados', level=2)
    add_table_styled(doc,
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

    doc.save('reporte.docx')
    print("OK -> reporte.docx generado con estilos nombrados y margenes A4 20mm")

if __name__ == "__main__":
    build()
