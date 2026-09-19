"""
Template anti-alucinacion para .pptx — COPIA este archivo, no generes desde cero.
Requiere: pip install python-pptx
Uso: python generar-pptx.py
Respeta tokens de SKILL.md: 16:9, 48px margen, >=24pt, max 6 bullets, master unico.
Paleta: agente reemplaza PALETTE segun propuesta contextual aprobada (ver SKILL.md).
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# === PALETTE: agente reemplaza segun contexto ===
PALETTE = {
    "primary": "1A56DB",
    "accent": "0E9F6E",
    "neutral_dark": "111827",
    "neutral_light": "F3F4F6",
}
FONT_NAME = "Calibri"  # Inter -> Calibri/Helvetica en PowerPoint

WIDTH = Inches(13.33)
HEIGHT = Inches(7.5)
MARGIN = Inches(0.5)  # ~48px a 96dpi + bleed

def hex_to_rgb(s):
    s = s.lstrip("#")
    return RGBColor(int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))

def set_bg(slide, hex_color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = hex_to_rgb(hex_color)

def add_shape(slide, left, top, width, height, fill_hex=None, line_hex=None):
    shape = slide.shapes.add_shape(1, left, top, width, height)  # rectangle
    shape.line.fill.background()
    if fill_hex:
        shape.fill.solid()
        shape.fill.fore_color.rgb = hex_to_rgb(fill_hex)
    else:
        shape.fill.background()
    if line_hex:
        shape.line.color.rgb = hex_to_rgb(line_hex)
        shape.line.width = Pt(1)
    return shape

def add_text_box(slide, left, top, width, height, text, size_pt, bold=False, color_hex="111827", alignment=PP_ALIGN.LEFT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size_pt)
    p.font.bold = bold
    p.font.name = FONT_NAME
    p.font.color.rgb = hex_to_rgb(color_hex)
    p.alignment = alignment
    return txBox

def add_bullet_slide(prs, title, bullets, kicker=None):
    # Blank layout
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, "FFFFFF")
    # Top bar
    add_shape(slide, Inches(0), Inches(0), WIDTH, Inches(0.08), fill_hex=PALETTE["primary"])
    # Kicker
    y = MARGIN
    if kicker:
        add_text_box(slide, MARGIN, y, WIDTH - MARGIN*2, Inches(0.3), kicker.upper(), 9, bold=True, color_hex=PALETTE["primary"])
        y += Inches(0.35)
    # Title
    add_text_box(slide, MARGIN, y, WIDTH - MARGIN*2, Inches(0.6), title, 32, bold=True, color_hex=PALETTE["neutral_dark"])
    y += Inches(0.75)
    # Divider
    add_shape(slide, MARGIN, y, Inches(1.2), Inches(0.04), fill_hex=PALETTE["accent"])
    y += Inches(0.25)
    # Bullets — max 6, truncado a proposito
    bullets = bullets[:6]
    for i, bullet in enumerate(bullets):
        # bullet dot
        add_shape(slide, MARGIN, y + Inches(0.08), Inches(0.12), Inches(0.12), fill_hex=PALETTE["primary"])
        add_text_box(slide, MARGIN + Inches(0.25), y, WIDTH - MARGIN*2 - Inches(0.25), Inches(0.35), bullet, 18, color_hex="1F2937")
        y += Inches(0.45)
    # Footer
    add_text_box(slide, MARGIN, HEIGHT - Inches(0.4), WIDTH - MARGIN*2, Inches(0.2), "Confidencial  ·  Tu Marca / Proyecto  ·  31/08/2026", 7, color_hex="6B7280", alignment=PP_ALIGN.RIGHT)
    return slide

def build():
    prs = Presentation()
    prs.slide_width = WIDTH
    prs.slide_height = HEIGHT

    # --- Slide 1: Portada ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, PALETTE["primary"])
    add_text_box(slide, MARGIN, Inches(1.2), WIDTH - MARGIN*2, Inches(0.3), "TU MARCA / PROYECTO  ·  2026", 10, bold=True, color_hex="FFFFFF", alignment=PP_ALIGN.LEFT)
    add_text_box(slide, MARGIN, Inches(2.0), WIDTH - MARGIN*2, Inches(1.2), "Título de la\nPresentación", 44, bold=True, color_hex="FFFFFF")
    add_text_box(slide, MARGIN, Inches(3.6), WIDTH - MARGIN*2, Inches(0.4), "Subtítulo en una línea: qué decisión habilita este deck.", 16, color_hex="E5E7EB")
    add_shape(slide, MARGIN, Inches(4.4), Inches(1.5), Inches(0.06), fill_hex=PALETTE["accent"])
    add_text_box(slide, MARGIN, HEIGHT - Inches(0.5), WIDTH - MARGIN*2, Inches(0.3), "Presentado por Nombre  ·  Confidencial", 9, color_hex="BFDBFE")

    # --- Slide 2: Contenido ---
    add_bullet_slide(prs,
        kicker="Contexto",
        title="Objetivo y alcance",
        bullets=[
            "Problema a resolver en 1 línea.",
            "Alcance: qué incluye / qué no incluye.",
            "Criterio de éxito medible.",
        ]
    )

    # --- Slide 3: KPIs ---
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, "FFFFFF")
    add_shape(slide, Inches(0), Inches(0), WIDTH, Inches(0.08), fill_hex=PALETTE["primary"])
    add_text_box(slide, MARGIN, MARGIN, WIDTH - MARGIN*2, Inches(0.5), "Resultados clave", 32, bold=True, color_hex=PALETTE["neutral_dark"])
    # 2 cards
    for idx, (kpi, label) in enumerate([("84,2%", "KPI principal"), ("1.240", "Registros")] ):
        left = MARGIN + idx * (WIDTH - MARGIN*2 + Inches(0.3)) / 2 if idx == 0 else MARGIN + (WIDTH - MARGIN*2)/2 + Inches(0.15)
        card = add_shape(slide, left, Inches(1.8), (WIDTH - MARGIN*2)/2 - Inches(0.15), Inches(1.8), fill_hex=PALETTE["neutral_light"], line_hex="E5E7EB")
        add_text_box(slide, left + Inches(0.3), Inches(2.0), Inches(2), Inches(0.6), kpi, 32, bold=True, color_hex=PALETTE["primary"])
        add_text_box(slide, left + Inches(0.3), Inches(2.7), Inches(2), Inches(0.3), label.upper(), 9, bold=True, color_hex="6B7280")
    add_text_box(slide, MARGIN, HEIGHT - Inches(0.4), WIDTH - MARGIN*2, Inches(0.2), "Fuente: sistema interno  ·  Corte 30/08/2026", 7, color_hex="6B7280", alignment=PP_ALIGN.RIGHT)

    # --- Slide 4: Cierre ---
    add_bullet_slide(prs,
        kicker="Siguiente paso",
        title="Conclusiones",
        bullets=[
            "Conclusión 1 con dato.",
            "Conclusión 2 con implicancia.",
            "Acción con responsable y fecha.",
        ]
    )

    prs.save('presentacion.pptx')
    print("OK -> presentacion.pptx 16:9 master unico, tipografia >=18pt, max 6 bullets")

if __name__ == "__main__":
    build()
