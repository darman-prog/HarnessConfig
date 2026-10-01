"""
Template anti-alucinacion para .pptx — COPIA este archivo, no generes desde cero.
Requiere: pip install python-pptx
Uso: python generar-pptx.py
Respeta tokens de SKILL.md: 16:9, 48px margen, >=24pt, max 6 bullets, master unico.
Paleta: agente reemplaza PALETTE segun propuesta contextual aprobada (ver SKILL.md).

Version 2.0:
  - hex_to_rgb con validacion de formato (#FFF, FFF, #FFFFFF, FFFFFF)
  - layout con constantes nombradas y posicion de cards KPI generalizada (1-4)
  - add_title_slide y add_kpi_slide extraidos como helpers reutilizables
  - warning al truncar bullets (>6) y KPIs (>4); validacion de longitud de texto
  - fecha dinamica en footers
  - manejo de errores al guardar, logging estructurado y type hints
"""
from __future__ import annotations

import logging
import sys
from datetime import date
from typing import List, Optional, Tuple

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.shapes.autoshape import Shape

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

FONT_NAME = "Calibri"  # Inter no disponible en PowerPoint -> Calibri/Helvetica

# ─────────────────────────────────────────────────────────────
# Dimensiones 16:9 y margenes
# ─────────────────────────────────────────────────────────────
WIDTH = Inches(13.33)    # 16:9 widescreen
HEIGHT = Inches(7.5)
MARGIN = Inches(0.5)     # ~48px a 96dpi + bleed

# Constantes de layout
TOP_BAR_HEIGHT = Inches(0.08)       # Barra de color superior
KICKER_SIZE = 9                      # pt
KICKER_HEIGHT = Inches(0.3)
KICKER_SPACING = Inches(0.35)
TITLE_SIZE = 32                      # pt
TITLE_HEIGHT = Inches(0.6)
TITLE_SPACING = Inches(0.75)
DIVIDER_WIDTH = Inches(1.2)
DIVIDER_HEIGHT = Inches(0.04)
DIVIDER_SPACING = Inches(0.25)
BULLET_DOT_SIZE = Inches(0.12)      # Tamano del punto de bullet
BULLET_DOT_OFFSET = Inches(0.08)    # Offset vertical del punto
BULLET_TEXT_SIZE = 24                # pt (SKILL.md: cuerpo >=24pt)
BULLET_TEXT_HEIGHT = Inches(0.45)
BULLET_SPACING = Inches(0.5)        # Espacio entre bullets
FOOTER_HEIGHT = Inches(0.2)
FOOTER_SIZE = 7                      # pt
CARD_SPACING = Inches(0.3)          # Espacio entre cards KPI
CARD_HEIGHT = Inches(1.8)
CARD_PADDING = Inches(0.3)          # Padding interno de la card

MAX_BULLETS = 6
MAX_KPIS = 4


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


def get_footer_date() -> str:
    """Devuelve la fecha actual formateada para el footer."""
    return date.today().strftime('%d/%m/%Y')


def validate_text_length(text: str, max_chars: int, context: str = "") -> None:
    """Emite warning si el texto excede el limite recomendado."""
    if len(text) > max_chars:
        logger.warning(
            f"{context} excede {max_chars} caracteres "
            f"({len(text)}): '{text[:50]}...'"
        )


# ─────────────────────────────────────────────────────────────
# Primitivas de dibujo
# ─────────────────────────────────────────────────────────────
def set_bg(slide, hex_color: str) -> None:
    """Establece el fondo de un slide."""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = hex_to_rgb(hex_color)


def add_shape(
    slide,
    left: Emu,
    top: Emu,
    width: Emu,
    height: Emu,
    fill_hex: Optional[str] = None,
    line_hex: Optional[str] = None,
    line_width_pt: float = 1.0
) -> Shape:
    """Anade un rectangulo al slide.

    Args:
        slide: Slide destino
        left, top, width, height: Posicion y dimensiones
        fill_hex: Color de relleno (None = transparente)
        line_hex: Color de borde (None = sin borde)
        line_width_pt: Grosor del borde en puntos

    Returns:
        Shape creado
    """
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, left, top, width, height
    )

    # Sin borde por defecto
    shape.line.fill.background()

    if fill_hex:
        shape.fill.solid()
        shape.fill.fore_color.rgb = hex_to_rgb(fill_hex)
    else:
        shape.fill.background()

    if line_hex:
        shape.line.color.rgb = hex_to_rgb(line_hex)
        shape.line.width = Pt(line_width_pt)

    return shape


def add_text_box(
    slide,
    left: Emu,
    top: Emu,
    width: Emu,
    height: Emu,
    text: str,
    size_pt: int,
    bold: bool = False,
    color_hex: str = "111827",
    alignment: PP_ALIGN = PP_ALIGN.LEFT,
    vertical_anchor: MSO_ANCHOR = MSO_ANCHOR.TOP
) -> Shape:
    """Anade una caja de texto al slide.

    Args:
        slide: Slide destino
        left, top, width, height: Posicion y dimensiones
        text: Contenido de texto
        size_pt: Tamano de fuente en puntos
        bold: Negrita
        color_hex: Color del texto
        alignment: Alineacion horizontal
        vertical_anchor: Alineacion vertical

    Returns:
        Shape del cuadro de texto creado
    """
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = vertical_anchor

    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size_pt)
    p.font.bold = bold
    p.font.name = FONT_NAME
    p.font.color.rgb = hex_to_rgb(color_hex)
    p.alignment = alignment

    return txBox


# ─────────────────────────────────────────────────────────────
# Slides reutilizables
# ─────────────────────────────────────────────────────────────
def add_bullet_slide(
    prs: Presentation,
    title: str,
    bullets: List[str],
    kicker: Optional[str] = None
):
    """Crea un slide con bullets (max 6, con warning si se truncan).

    Args:
        prs: Presentacion destino
        title: Titulo principal
        bullets: Lista de bullets
        kicker: Texto pequeno superior (opcional)

    Returns:
        Slide creado
    """
    # Validar y truncar bullets
    if len(bullets) > MAX_BULLETS:
        logger.warning(
            f"Slide '{title}' tiene {len(bullets)} bullets, "
            f"se truncaran a {MAX_BULLETS}"
        )
        bullets = bullets[:MAX_BULLETS]

    # Validar longitud de titulo
    validate_text_length(title, 80, "Titulo del slide")

    # Blank layout (indice 6)
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, "FFFFFF")

    # Barra superior de color
    add_shape(
        slide, Inches(0), Inches(0), WIDTH, TOP_BAR_HEIGHT,
        fill_hex=PALETTE["primary"]
    )

    # Kicker (opcional)
    y = MARGIN
    if kicker:
        add_text_box(
            slide, MARGIN, y, WIDTH - MARGIN * 2, KICKER_HEIGHT,
            kicker.upper(), KICKER_SIZE, bold=True,
            color_hex=PALETTE["primary"]
        )
        y += KICKER_SPACING

    # Titulo
    add_text_box(
        slide, MARGIN, y, WIDTH - MARGIN * 2, TITLE_HEIGHT,
        title, TITLE_SIZE, bold=True,
        color_hex=PALETTE["neutral_dark"]
    )
    y += TITLE_SPACING

    # Divider
    add_shape(
        slide, MARGIN, y, DIVIDER_WIDTH, DIVIDER_HEIGHT,
        fill_hex=PALETTE["accent"]
    )
    y += DIVIDER_SPACING

    # Bullets
    for i, bullet in enumerate(bullets):
        validate_text_length(bullet, 120, f"Bullet {i+1}")

        # Punto de bullet
        add_shape(
            slide,
            MARGIN,
            y + BULLET_DOT_OFFSET,
            BULLET_DOT_SIZE,
            BULLET_DOT_SIZE,
            fill_hex=PALETTE["primary"]
        )

        # Texto del bullet
        add_text_box(
            slide,
            MARGIN + Inches(0.25),
            y,
            WIDTH - MARGIN * 2 - Inches(0.25),
            BULLET_TEXT_HEIGHT,
            bullet,
            BULLET_TEXT_SIZE,
            color_hex="1F2937"
        )
        y += BULLET_SPACING

    # Footer
    footer_text = f"Confidencial  ·  Tu Marca / Proyecto  ·  {get_footer_date()}"
    add_text_box(
        slide, MARGIN, HEIGHT - Inches(0.4), WIDTH - MARGIN * 2, FOOTER_HEIGHT,
        footer_text, FOOTER_SIZE, color_hex="6B7280",
        alignment=PP_ALIGN.RIGHT
    )

    return slide


def add_kpi_slide(
    prs: Presentation,
    title: str,
    kpis: List[Tuple[str, str]],
    source_note: Optional[str] = None
):
    """Crea un slide con cards de KPIs (hasta 4).

    Args:
        prs: Presentacion destino
        title: Titulo del slide
        kpis: Lista de tuplas (valor, etiqueta)
        source_note: Nota de fuente para el footer (opcional)

    Returns:
        Slide creado
    """
    if len(kpis) > MAX_KPIS:
        logger.warning(
            f"Slide '{title}' tiene {len(kpis)} KPIs, "
            f"se mostraran solo los primeros {MAX_KPIS}"
        )
        kpis = kpis[:MAX_KPIS]

    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, "FFFFFF")

    # Barra superior
    add_shape(
        slide, Inches(0), Inches(0), WIDTH, TOP_BAR_HEIGHT,
        fill_hex=PALETTE["primary"]
    )

    # Titulo
    add_text_box(
        slide, MARGIN, MARGIN, WIDTH - MARGIN * 2, Inches(0.5),
        title, TITLE_SIZE, bold=True,
        color_hex=PALETTE["neutral_dark"]
    )

    # Calculo limpio de posicion de cards
    num_cards = len(kpis)
    if num_cards == 0:
        logger.error("add_kpi_slide: se requieren al menos 1 KPI")
        return slide

    total_width = WIDTH - MARGIN * 2
    spacing = CARD_SPACING if num_cards > 1 else Inches(0)
    card_width = (total_width - spacing * (num_cards - 1)) / num_cards

    for idx, (kpi_value, kpi_label) in enumerate(kpis):
        # Posicion horizontal calculada de forma clara
        left = MARGIN + idx * (card_width + spacing)

        # Card (rectangulo con fondo y borde)
        add_shape(
            slide,
            left, Inches(1.8),
            card_width, CARD_HEIGHT,
            fill_hex=PALETTE["neutral_light"],
            line_hex="E5E7EB",
            line_width_pt=1.0
        )

        # Valor del KPI
        add_text_box(
            slide,
            left + CARD_PADDING, Inches(2.0),
            card_width - CARD_PADDING * 2, Inches(0.6),
            kpi_value, TITLE_SIZE, bold=True,
            color_hex=PALETTE["primary"]
        )

        # Etiqueta del KPI
        add_text_box(
            slide,
            left + CARD_PADDING, Inches(2.7),
            card_width - CARD_PADDING * 2, Inches(0.3),
            kpi_label.upper(), KICKER_SIZE, bold=True,
            color_hex="6B7280"
        )

    # Footer con fuente
    footer_source = source_note or f"Fuente: sistema interno  ·  Corte {get_footer_date()}"
    add_text_box(
        slide, MARGIN, HEIGHT - Inches(0.4), WIDTH - MARGIN * 2, FOOTER_HEIGHT,
        footer_source, FOOTER_SIZE, color_hex="6B7280",
        alignment=PP_ALIGN.RIGHT
    )

    return slide


def add_title_slide(
    prs: Presentation,
    brand: str,
    title: str,
    subtitle: str,
    presenter: str
):
    """Crea el slide de portada.

    Args:
        prs: Presentacion destino
        brand: Nombre de marca/proyecto
        title: Titulo principal (max 2 lineas)
        subtitle: Subtitulo (1 linea)
        presenter: Nombre del presentador

    Returns:
        Slide creado
    """
    validate_text_length(title, 80, "Titulo de portada")
    validate_text_length(subtitle, 100, "Subtitulo de portada")

    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, PALETTE["primary"])

    # Brand line
    year = date.today().year
    add_text_box(
        slide, MARGIN, Inches(1.2), WIDTH - MARGIN * 2, Inches(0.3),
        f"{brand}  ·  {year}", 10, bold=True,
        color_hex="FFFFFF", alignment=PP_ALIGN.LEFT
    )

    # Titulo principal
    add_text_box(
        slide, MARGIN, Inches(2.0), WIDTH - MARGIN * 2, Inches(1.2),
        title, 44, bold=True, color_hex="FFFFFF"
    )

    # Subtitulo
    add_text_box(
        slide, MARGIN, Inches(3.6), WIDTH - MARGIN * 2, Inches(0.4),
        subtitle, 16, color_hex="E5E7EB"
    )

    # Divider
    add_shape(
        slide, MARGIN, Inches(4.4), Inches(1.5), Inches(0.06),
        fill_hex=PALETTE["accent"]
    )

    # Footer con presentador
    add_text_box(
        slide, MARGIN, HEIGHT - Inches(0.5), WIDTH - MARGIN * 2, Inches(0.3),
        f"Presentado por {presenter}  ·  Confidencial", 9,
        color_hex="BFDBFE"
    )

    return slide


# ─────────────────────────────────────────────────────────────
# Build principal
# ─────────────────────────────────────────────────────────────
def build(output_path: str = 'presentacion.pptx') -> None:
    """Genera la presentacion completa.

    Args:
        output_path: Ruta de salida del archivo .pptx
    """
    prs = Presentation()
    prs.slide_width = WIDTH
    prs.slide_height = HEIGHT

    # ─── Slide 1: Portada ───────────────────────────────────
    add_title_slide(
        prs,
        brand="TU MARCA / PROYECTO",
        title="Título de la\nPresentación",
        subtitle="Subtítulo en una línea: qué decisión habilita este deck.",
        presenter="Nombre"
    )

    # ─── Slide 2: Contenido ─────────────────────────────────
    add_bullet_slide(
        prs,
        kicker="Contexto",
        title="Objetivo y alcance",
        bullets=[
            "Problema a resolver en 1 línea.",
            "Alcance: qué incluye / qué no incluye.",
            "Criterio de éxito medible.",
        ]
    )

    # ─── Slide 3: KPIs ──────────────────────────────────────
    add_kpi_slide(
        prs,
        title="Resultados clave",
        kpis=[
            ("84,2%", "KPI principal"),
            ("1.240", "Registros"),
        ]
    )

    # ─── Slide 4: Cierre ────────────────────────────────────
    add_bullet_slide(
        prs,
        kicker="Siguiente paso",
        title="Conclusiones",
        bullets=[
            "Conclusión 1 con dato.",
            "Conclusión 2 con implicancia.",
            "Acción con responsable y fecha.",
        ]
    )

    # ─── Guardar ────────────────────────────────────────────
    try:
        prs.save(output_path)
        logger.info(
            f"OK -> {output_path} 16:9 master unico, "
            f"tipografia >=24pt, max {MAX_BULLETS} bullets"
        )
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
