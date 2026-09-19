/**
 * kit.js — sistema de maquetación para informes técnicos y académicos en .docx
 *
 * Uso:
 *   const K = require('./kit');
 *   K.theme('institucional');            // opcional, es el valor por defecto
 *   const cover = K.cover({ ... });
 *   const body  = [];
 *   const A = (...x) => x.flat().forEach(e => body.push(e));
 *   A(K.h1('1. Introducción'), K.rich('Texto con **negrita**.'));
 *   K.build({ cover, body, meta: {...}, out: '/ruta/archivo.docx' });
 *
 * Todo lo que devuelven los helpers son objetos de docx-js listos para
 * meter en el array `body`. Los helpers que devuelven varios elementos
 * (code, figure, note, bullets, cover) devuelven un array: aplánalo.
 */

const fs = require('fs');
const d = require('docx');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, HeadingLevel, BorderStyle, ShadingType, PageBreak, Header, Footer,
  PageNumber, TableOfContents, VerticalAlign, TabStopType, TabStopPosition, LevelFormat
} = d;

// ─────────────────────────────────────────────────────────────
// Temas
// ─────────────────────────────────────────────────────────────
const THEMES = {
  // azul pizarra + ocre quemado. Técnico, sobrio, imprime bien en B/N.
  institucional: {
    INK: '12333F', DEEP: '0E4257', ACCENT: 'B4531C', SOFT: 'EEF4F6',
    LINE: 'C2D4DB', CODEBG: 'F5F7F8', CODEBAR: 'E4EBEE', NOTEBG: 'FBF5F0',
    GREY: '5C6B73', BODY: '1F2D33',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  },
  // grafito + azul acero. Más neutro, buena opción corporativa.
  sobrio: {
    INK: '1C232B', DEEP: '2B4A63', ACCENT: '6B7B8C', SOFT: 'F0F2F4',
    LINE: 'D2D7DC', CODEBG: 'F6F7F8', CODEBAR: 'E7EAED', NOTEBG: 'F2F4F6',
    GREY: '667079', BODY: '23292F',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  },
  // verde bosque + arena. Para informes de campo, ambiental, agro.
  campo: {
    INK: '1E3A2B', DEEP: '2C5641', ACCENT: '9A6B26', SOFT: 'EFF4EF',
    LINE: 'CBD8CE', CODEBG: 'F6F8F6', CODEBAR: 'E6EDE7', NOTEBG: 'FAF6EE',
    GREY: '5F6B62', BODY: '23302A',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  },
  // burdeos + gris cálido. Humanidades, derecho, ensayo.
  academico: {
    INK: '2B1B1F', DEEP: '6B2C39', ACCENT: '8A6A3B', SOFT: 'F5F0F1',
    LINE: 'DBD0D2', CODEBG: 'F7F5F5', CODEBAR: 'EBE4E5', NOTEBG: 'FAF6F0',
    GREY: '6E6265', BODY: '2A2225',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  }
};

let T = { ...THEMES.institucional };
function theme(nameOrObj) {
  if (typeof nameOrObj === 'string') {
    if (!THEMES[nameOrObj]) throw new Error('Tema desconocido: ' + nameOrObj);
    T = { ...THEMES[nameOrObj] };
  } else {
    T = { ...T, ...nameOrObj };
  }
  return T;
}

// Ancho útil de tabla en DXA. Por defecto A4 con márgenes 20 mm:
// 11906 (ancho A4) − 1134 − 1134 = 9638. Cambia si cambias márgenes.
let W = 9638;
function contentWidth(v) { if (v) W = v; return W; }

// ─────────────────────────────────────────────────────────────
// Internos
// ─────────────────────────────────────────────────────────────
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thin = (c) => ({ style: BorderStyle.SINGLE, size: 4, color: c || T.LINE });

// divide "texto con **negrita**" en TextRun
function runs(text, opt = {}) {
  return String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map(s => {
    const b = s.startsWith('**');
    return new TextRun({
      text: b ? s.slice(2, -2) : s,
      bold: b || opt.bold,
      italics: opt.italics,
      font: opt.font || T.BFONT,
      size: opt.size || 21,
      color: opt.color || T.BODY
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Texto
// ─────────────────────────────────────────────────────────────

/** Párrafo justificado. Admite **negrita** en el texto. */
function rich(text, opt = {}) {
  return new Paragraph({
    alignment: opt.align || AlignmentType.JUSTIFIED,
    spacing: { before: opt.before ?? 0, after: opt.after ?? 160, line: 288 },
    children: runs(text, opt)
  });
}

/** Párrafo simple, sin justificar. */
function p(text, opt = {}) {
  return rich(text, { align: AlignmentType.LEFT, ...opt });
}

/** Título de sección. keepNext evita que quede huérfano al pie de página. */
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    keepNext: true,
    spacing: { before: 420, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: T.ACCENT, space: 6 } },
    children: [new TextRun({ text, font: T.HFONT, size: 30, bold: true, color: T.INK })]
  });
}

/** Subtítulo. */
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, font: T.HFONT, size: 24, bold: true, color: T.DEEP })]
  });
}

/** Etiqueta en versalitas para encabezar una lista o un bloque. */
function label(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 60, after: 60 },
    children: [new TextRun({
      text, font: T.BFONT, size: 15, bold: true, color: T.ACCENT,
      allCaps: true, characterSpacing: 30
    })]
  });
}

function spacer(h) {
  return new Paragraph({ spacing: { after: h || 160 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function bullets(items) {
  return items.map(t => new Paragraph({
    numbering: { reference: 'kit-vinetas', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 100, line: 276 },
    children: runs(t)
  }));
}

function numbered(items) {
  return items.map(t => new Paragraph({
    numbering: { reference: 'kit-pasos', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 100, line: 276 },
    children: runs(t)
  }));
}

// ─────────────────────────────────────────────────────────────
// Tabla
// ─────────────────────────────────────────────────────────────
function cell(text, o = {}) {
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: o.span,
    children: (Array.isArray(text) ? text : [text]).map(t => new Paragraph({
      alignment: o.align,
      spacing: { before: 0, after: 0, line: 252 },
      children: [new TextRun({
        text: String(t),
        font: o.mono ? T.MFONT : T.BFONT,
        size: o.size || (o.head ? 18 : 19),
        bold: o.head || o.bold,
        color: o.head ? 'FFFFFF' : (o.color || T.BODY)
      })]
    }))
  });
}

/**
 * table(head, rows, widths, opts)
 *   head    : array de encabezados
 *   rows    : array de arrays (strings)
 *   widths  : anchos DXA; DEBEN sumar exactamente contentWidth()
 *   opts    : { mono: [índices de columna monoespaciadas], boldFirst: bool }
 */
function table(head, rows, widths, opts = {}) {
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum !== W) throw new Error(`Los anchos suman ${sum} y deben sumar ${W}`);
  const mono = opts.mono || [];
  const trs = [new TableRow({
    tableHeader: true,
    children: head.map((t, i) => cell(t, { w: widths[i], head: true, fill: T.DEEP }))
  })];
  rows.forEach((r, ri) => trs.push(new TableRow({
    children: r.map((t, i) => cell(t, {
      w: widths[i],
      fill: ri % 2 ? T.SOFT : 'FFFFFF',
      mono: mono.includes(i),
      bold: opts.boldFirst && i === 0
    }))
  })));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: thin(), bottom: thin(), left: thin(), right: thin(),
      insideHorizontal: thin(), insideVertical: thin()
    },
    rows: trs
  });
}

// ─────────────────────────────────────────────────────────────
// Bloque de consola / código
// ─────────────────────────────────────────────────────────────
/**
 * code(lines, caption, allowSplit)
 *   lines      : array de líneas (nunca uses \n dentro de una línea)
 *   caption    : título del bloque, va DENTRO del marco para que no se separe
 *   allowSplit : true solo para bloques largos (anexos) que no caben en una página
 *
 * Mantén las líneas por debajo de ~100 caracteres: a 8 pt en Consolas es el
 * límite antes de que se desborden en carta con márgenes normales.
 */
function code(lines, caption, allowSplit) {
  const inner = [];
  if (caption) {
    inner.push(new Paragraph({
      keepNext: !allowSplit,
      shading: { type: ShadingType.CLEAR, fill: T.CODEBAR, color: 'auto' },
      spacing: { before: 0, after: 120 },
      indent: { left: 120, right: 120 },
      children: [new TextRun({
        text: '  ' + caption, font: T.BFONT, size: 15, bold: true,
        color: T.DEEP, allCaps: true, characterSpacing: 30
      })]
    }));
  }
  lines.forEach(l => inner.push(new Paragraph({
    spacing: { before: 0, after: 0, line: 230 },
    indent: { left: 180, right: 120 },
    children: [new TextRun({ text: l, font: T.MFONT, size: 16, color: T.INK })]
  })));

  return [
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      borders: {
        top: thin(), bottom: thin(),
        left: { style: BorderStyle.SINGLE, size: 18, color: T.DEEP },
        right: thin(), insideHorizontal: noBorder, insideVertical: noBorder
      },
      rows: [new TableRow({
        cantSplit: !allowSplit,
        children: [new TableCell({
          width: { size: W, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: T.CODEBG, color: 'auto' },
          margins: { top: 120, bottom: 140, left: 0, right: 0 },
          children: inner
        })]
      })]
    }),
    spacer(220)
  ];
}

// ─────────────────────────────────────────────────────────────
// Figuras
// ─────────────────────────────────────────────────────────────
let FIGN = 0;
let FIGLIST = [];
function resetFigures() { FIGN = 0; FIGLIST = []; }
function figureList() { return FIGLIST.slice(); }

/**
 * figure(title, height)  → marco de evidencia + pie numerado
 *
 * El marco entero es una sola fila con cantSplit, así que nunca se parte
 * entre páginas. La numeración es fija (no campo SEQ): así se ve correcta
 * aunque el usuario no actualice campos al abrir el archivo.
 *
 * height en DXA: 2600 ≈ captura de consola, 3800 ≈ captura de pantalla completa.
 */
function figure(title, height) {
  const H = height || 3000;
  FIGN += 1;
  const num = FIGN;
  FIGLIST.push([String(num), title]);

  const inner = [new Paragraph({
    keepNext: true,
    shading: { type: ShadingType.CLEAR, fill: T.DEEP, color: 'auto' },
    spacing: { before: 0, after: 0, line: 300 },
    children: [new TextRun({
      text: '   EVIDENCIA \u00b7 ' + title.toUpperCase(),
      font: T.BFONT, size: 15, bold: true, color: 'FFFFFF', characterSpacing: 26
    })]
  })];

  const blanks = Math.max(2, Math.round(H / 260));
  for (let i = 0; i < blanks; i++) {
    inner.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0, line: 260 },
      children: i === Math.floor(blanks / 2)
        ? [new TextRun({
            text: '[ Reemplaza este marco por la captura de pantalla ]',
            font: T.BFONT, size: 18, italics: true, color: '9AAAB2'
          })]
        : []
    }));
  }

  return [
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      borders: {
        top: thin(), bottom: thin(), left: thin(), right: thin(),
        insideHorizontal: noBorder, insideVertical: noBorder
      },
      rows: [new TableRow({
        cantSplit: true,
        children: [new TableCell({
          width: { size: W, type: WidthType.DXA },
          margins: { top: 0, bottom: 120, left: 0, right: 0 },
          children: inner
        })]
      })]
    }),
    new Paragraph({
      style: 'Caption',
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({ text: 'Figura ' + num + '. ', font: T.BFONT, size: 17, color: T.GREY, italics: true, bold: true }),
        new TextRun({ text: title, font: T.BFONT, size: 17, color: T.GREY, italics: true })
      ]
    })
  ];
}

/** Marcador: build() lo sustituye por la tabla con todas las figuras. */
function figureIndex() { return { __kitFigureIndex: true }; }

// ─────────────────────────────────────────────────────────────
// Nota destacada
// ─────────────────────────────────────────────────────────────
function note(title, text) {
  return [
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [W],
      borders: {
        top: noBorder, bottom: noBorder, right: noBorder,
        left: { style: BorderStyle.SINGLE, size: 18, color: T.ACCENT },
        insideHorizontal: noBorder, insideVertical: noBorder
      },
      rows: [new TableRow({
        cantSplit: true,
        children: [new TableCell({
          width: { size: W, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: T.NOTEBG, color: 'auto' },
          margins: { top: 140, bottom: 140, left: 180, right: 160 },
          children: [
            new Paragraph({
              keepNext: true, spacing: { before: 0, after: 60 },
              children: [new TextRun({ text: title, font: T.BFONT, size: 18, bold: true, color: T.ACCENT })]
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 0, after: 0, line: 264 },
              children: runs(text, { size: 19 })
            })
          ]
        })]
      })]
    }),
    spacer(220)
  ];
}

// ─────────────────────────────────────────────────────────────
// Portada
// ─────────────────────────────────────────────────────────────
/**
 * cover({ institucion, linea, titulo, subtitulo, resumen, datos, stats })
 *   datos : array de [campo, valor]
 *   stats : array de [numero, etiqueta] — opcional, máximo 4
 */
function cover(o) {
  const out = [spacer(500)];
  if (o.institucion) out.push(new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({
      text: o.institucion.toUpperCase(), font: T.BFONT, size: 17,
      bold: true, color: T.ACCENT, characterSpacing: 44
    })]
  }));
  if (o.linea) out.push(new Paragraph({
    spacing: { after: 700 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: T.LINE, space: 8 } },
    children: [new TextRun({ text: o.linea, font: T.BFONT, size: 19, color: T.GREY })]
  }));
  out.push(new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: o.titulo, font: T.HFONT, size: 72, bold: true, color: T.INK })]
  }));
  if (o.subtitulo) out.push(new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text: o.subtitulo, font: T.HFONT, size: 34, color: T.DEEP })]
  }));
  if (o.resumen) out.push(new Paragraph({
    spacing: { after: 1200 },
    children: [new TextRun({ text: o.resumen, font: T.BFONT, size: 21, italics: true, color: T.GREY })]
  }));
  if (o.datos && o.datos.length) {
    out.push(table(['Campo', 'Detalle'], o.datos, [2900, W - 2900], { boldFirst: true }));
  }
  if (o.stats && o.stats.length) {
    out.push(spacer(560));
    const n = o.stats.length;
    const cw = Math.floor(W / n);
    const widths = Array(n).fill(cw);
    widths[n - 1] = W - cw * (n - 1);
    out.push(new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: widths,
      borders: {
        top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
        insideHorizontal: noBorder,
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: T.LINE }
      },
      rows: [new TableRow({
        children: o.stats.map(([num, lab], i) => new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 80, right: 80 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: String(num), font: T.HFONT, size: 40, bold: true, color: T.DEEP })]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER, spacing: { after: 0 },
              children: [new TextRun({ text: lab, font: T.BFONT, size: 16, color: T.GREY, characterSpacing: 20 })]
            })
          ]
        }))
      })]
    }));
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Índices
// ─────────────────────────────────────────────────────────────
/** Índice de contenido: campo real de Word, se rellena al actualizar campos. */
function toc(titulo) {
  return [
    new Paragraph({
      keepNext: true,
      spacing: { after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: T.ACCENT, space: 6 } },
      children: [new TextRun({ text: titulo || 'Contenido', font: T.HFONT, size: 30, bold: true, color: T.INK })]
    }),
    new Paragraph({
      spacing: { before: 100, after: 200 },
      children: [new TextRun({
        text: 'Índice automático: al abrir el archivo en Word, haz clic sobre él y pulsa F9 para rellenarlo con los títulos y los números de página.',
        font: T.BFONT, size: 17, italics: true, color: T.GREY
      })]
    }),
    new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-2' })
  ];
}

/** Encabezado del índice de figuras. Debe ir seguido de figureIndex(). */
function figureIndexHeading(titulo) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: T.ACCENT, space: 6 } },
    children: [new TextRun({ text: titulo || 'Índice de figuras', font: T.HFONT, size: 30, bold: true, color: T.INK })]
  });
}

// ─────────────────────────────────────────────────────────────
// Documento
// ─────────────────────────────────────────────────────────────
/**
 * build({ cover, body, meta, out, margins })
 *   meta : { titulo, autor, headerIzq, headerDer, footerIzq }
 */
function build({ cover: portada, body, meta = {}, out, margins }) {
  // sustituir el marcador del índice de figuras
  const idx = body.findIndex(e => e && e.__kitFigureIndex);
  if (idx >= 0) {
    body.splice(idx, 1, table(
      ['N.º', 'Descripción de la figura'],
      FIGLIST.length ? FIGLIST : [['—', 'Sin figuras en este documento']],
      [900, W - 900]
    ));
  }

  const pageSetup = {
    page: {
      size: { width: 11906, height: 16838 },           // A4 vertical
      margin: margins || { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 620, footer: 560 } // 20 mm
    }
  };

  const header = new Header({
    children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: T.ACCENT, space: 4 } },
      children: [
        new TextRun({ text: meta.headerIzq || '', font: T.BFONT, size: 15, color: T.GREY, characterSpacing: 16 }),
        new TextRun({ text: '\t' + (meta.headerDer || ''), font: T.BFONT, size: 15, color: T.GREY })
      ]
    })]
  });

  const footer = new Footer({
    children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: meta.footerIzq || '', font: T.BFONT, size: 15, color: T.GREY }),
        new TextRun({ text: '\tPágina ', font: T.BFONT, size: 15, color: T.GREY }),
        new TextRun({ children: [PageNumber.CURRENT], font: T.BFONT, size: 15, bold: true, color: T.DEEP }),
        new TextRun({ text: ' de ', font: T.BFONT, size: 15, color: T.GREY }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: T.BFONT, size: 15, color: T.GREY })
      ]
    })]
  });

  const sections = [];
  if (portada && portada.length) sections.push({ properties: pageSetup, children: portada });
  sections.push({
    properties: pageSetup,
    headers: { default: header },
    footers: { default: footer },
    children: body
  });

  const doc = new Document({
    creator: meta.autor || '',
    title: meta.titulo || '',
    description: meta.descripcion || '',
    features: { updateFields: true },
    styles: {
      default: { document: { run: { font: T.BFONT, size: 21, color: T.BODY } } },
      paragraphStyles: [
        { id: 'Caption', name: 'Caption', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: T.BFONT, size: 17, italics: true, color: T.GREY } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: T.HFONT, size: 30, bold: true, color: T.INK } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: T.HFONT, size: 24, bold: true, color: T.DEEP } }
      ]
    },
    numbering: {
      config: [
        { reference: 'kit-vinetas', levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: T.ACCENT } }
        }] },
        { reference: 'kit-pasos', levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 300 } }, run: { bold: true, color: T.DEEP } }
        }] }
      ]
    },
    sections
  });

  return Packer.toBuffer(doc).then(b => {
    fs.writeFileSync(out, b);
    console.log('Escrito: ' + out + ' (' + FIGN + ' figuras)');
    return out;
  });
}

module.exports = {
  theme, THEMES, contentWidth,
  p, rich, h1, h2, label, spacer, pageBreak, bullets, numbered,
  table, cell, code, figure, figureIndex, figureIndexHeading, resetFigures, figureList,
  note, cover, toc, build,
  docx: d
};
