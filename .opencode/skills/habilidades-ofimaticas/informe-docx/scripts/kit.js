/**
 * kit.js — sistema de maquetación para informes técnicos y académicos en .docx
 * v2.0
 *
 * Mejoras sobre v1:
 *   ✓ Estado encapsulado en la clase Report (aislado con new Report(); la API
 *     legacy conserva un singleton compartido, ver aviso antes de _default)
 *   ✓ Markdown extendido: **negrita**, *cursiva*, `codigo`, ***ambos***, [enlace](url)
 *   ✓ Soporte real de imágenes en figure() (imagePath / imageBuffer)
 *   ✓ Syntax highlighting básico en code() para js / py / bash / sql / json
 *   ✓ Nuevos helpers: callout(), citation(), link(), h3()
 *   ✓ Validación robusta en table() (tipos y número de columnas)
 *   ✓ Soporte opcional de orientación landscape por sección
 *
 * Uso (API legacy, idéntica a v1):
 *   const K = require('./kit');
 *   K.theme('institucional');
 *   const cover = K.cover({ ... });
 *   const body  = [];
 *   const A = (...x) => x.flat().forEach(e => body.push(e));
 *   A(K.h1('1. Introducción'), K.rich('Texto con **negrita** y *cursiva*.'));
 *   K.build({ cover, body, meta: {...}, out: '/ruta/archivo.docx' });
 *
 * Uso (API moderna, recomendada):
 *   const { Report } = require('./kit');
 *   const r = new Report({ theme: 'institucional' });
 *   const cover = r.cover({ ... });
 *   const body  = [ r.h1('1. Introducción'), r.rich('Texto con **negrita**.') ];
 *   await r.build({ cover, body, meta: {...}, out: 'reporte.docx' });
 */

const fs = require('node:fs');
const path = require('node:path');
const d = require('docx');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, HeadingLevel, BorderStyle, ShadingType, PageBreak, Header, Footer,
  PageNumber, TableOfContents, VerticalAlign, TabStopType, TabStopPosition, LevelFormat,
  ImageRun, ExternalHyperlink, PageOrientation
} = d;

// ─────────────────────────────────────────────────────────────
// Temas
// ─────────────────────────────────────────────────────────────
const THEMES = {
  institucional: {
    INK: '12333F', DEEP: '0E4257', ACCENT: 'B4531C', SOFT: 'EEF4F6',
    LINE: 'C2D4DB', CODEBG: 'F5F7F8', CODEBAR: 'E4EBEE', NOTEBG: 'FBF5F0',
    GREY: '5C6B73', BODY: '1F2D33',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  },
  sobrio: {
    INK: '1C232B', DEEP: '2B4A63', ACCENT: '6B7B8C', SOFT: 'F0F2F4',
    LINE: 'D2D7DC', CODEBG: 'F6F7F8', CODEBAR: 'E7EAED', NOTEBG: 'F2F4F6',
    GREY: '667079', BODY: '23292F',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  },
  campo: {
    INK: '1E3A2B', DEEP: '2C5641', ACCENT: '9A6B26', SOFT: 'EFF4EF',
    LINE: 'CBD8CE', CODEBG: 'F6F8F6', CODEBAR: 'E6EDE7', NOTEBG: 'FAF6EE',
    GREY: '5F6B62', BODY: '23302A',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  },
  academico: {
    INK: '2B1B1F', DEEP: '6B2C39', ACCENT: '8A6A3B', SOFT: 'F5F0F1',
    LINE: 'DBD0D2', CODEBG: 'F7F5F5', CODEBAR: 'EBE4E5', NOTEBG: 'FAF6F0',
    GREY: '6E6265', BODY: '2A2225',
    HFONT: 'Cambria', BFONT: 'Calibri', MFONT: 'Consolas'
  }
};

// ─────────────────────────────────────────────────────────────
// Reglas de syntax highlighting (sin dependencias externas)
// ─────────────────────────────────────────────────────────────
const HL_RULES = {
  js: [
    { re: /(\/\/[^\n]*)/g, color: '6A737D' },
    { re: /(\/\*[\s\S]*?\*\/)/g, color: '6A737D' },
    { re: /(`[^`]*`|"[^"\n]*"|'[^'\n]*')/g, color: '032F62' },
    { re: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|new|this|super|import|export|from|require|async|await|try|catch|finally|throw|typeof|instanceof|in|of|default|yield)\b/g, color: 'D73A49' },
    { re: /\b(true|false|null|undefined|NaN|Infinity)\b/g, color: '005CC5' },
    { re: /\b(\d+(?:\.\d+)?)\b/g, color: '005CC5' }
  ],
  py: [
    { re: /(#[^\n]*)/g, color: '6A737D' },
    { re: /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g, color: '032F62' },
    { re: /\b(def|class|return|if|elif|else|for|while|break|continue|import|from|as|try|except|finally|raise|with|pass|lambda|yield|async|await|and|or|not|in|is|True|False|None)\b/g, color: 'D73A49' },
    { re: /\b(\d+(?:\.\d+)?)\b/g, color: '005CC5' }
  ],
  bash: [
    { re: /(#[^\n]*)/g, color: '6A737D' },
    { re: /("[^"\n]*"|'[^'\n]*')/g, color: '032F62' },
    { re: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|in|until|select)\b/g, color: 'D73A49' },
    { re: /(\$\{?\w+\}?)/g, color: 'E36209' }
  ],
  sql: [
    { re: /(--[^\n]*)/g, color: '6A737D' },
    { re: /('[^']*')/g, color: '032F62' },
    { re: /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|INNER|LEFT|RIGHT|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|DISTINCT|UNION|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|COUNT|SUM|AVG|MIN|MAX|LIKE|BETWEEN|EXISTS)\b/gi, color: 'D73A49' },
    { re: /\b(\d+(?:\.\d+)?)\b/g, color: '005CC5' }
  ],
  json: [
    { re: /("(?:[^"\\]|\\.)*")(\s*:)/g, color: '005CC5' }, // keys
    { re: /:(\s*)("(?:[^"\\]|\\.)*")/g, color: '032F62' },  // string values
    { re: /\b(true|false|null)\b/g, color: 'D73A49' },
    { re: /\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, color: '005CC5' }
  ]
};

/**
 * Tokeniza una línea aplicando reglas de highlighting.
 * Devuelve [{text, color}] donde color=null significa "color por defecto".
 */
function highlight(line, lang) {
  const rules = HL_RULES[lang] || [];
  if (rules.length === 0 || line === '') return [{ text: line, color: null }];

  const tokens = [];
  const occupied = new Array(line.length).fill(false);

  for (const rule of rules) {
    const re = new RegExp(rule.re.source, rule.re.flags);
    let m;
    while ((m = re.exec(line)) !== null) {
      if (m.index === re.lastIndex) { re.lastIndex++; continue; }
      const start = m.index, end = re.lastIndex;
      let free = true;
      for (let i = start; i < end; i++) if (occupied[i]) { free = false; break; }
      if (free) {
        tokens.push({ start, end, text: m[0], color: rule.color });
        for (let i = start; i < end; i++) occupied[i] = true;
      }
    }
  }

  tokens.sort((a, b) => a.start - b.start);
  const result = [];
  let pos = 0;
  for (const t of tokens) {
    if (t.start > pos) result.push({ text: line.slice(pos, t.start), color: null });
    result.push({ text: t.text, color: t.color });
    pos = t.end;
  }
  if (pos < line.length) result.push({ text: line.slice(pos), color: null });
  return result.length ? result : [{ text: line, color: null }];
}

// ─────────────────────────────────────────────────────────────
// Clase Report (API moderna)
// ─────────────────────────────────────────────────────────────
class Report {
  constructor(options = {}) {
    this.T = { ...THEMES.institucional };
    if (options.theme) this.theme(options.theme);
    this.W = options.contentWidth || 9638;
    this._FIGN = 0;
    this._FIGLIST = [];
  }

  // ─── Configuración ────────────────────────────────────────
  theme(nameOrObj) {
    if (typeof nameOrObj === 'string') {
      if (!THEMES[nameOrObj]) throw new Error('Tema desconocido: ' + nameOrObj);
      this.T = { ...THEMES[nameOrObj] };
    } else if (nameOrObj && typeof nameOrObj === 'object') {
      this.T = { ...this.T, ...nameOrObj };
    }
    return this.T;
  }

  contentWidth(v) {
    if (v) this.W = v;
    return this.W;
  }

  resetFigures() { this._FIGN = 0; this._FIGLIST = []; return this; }
  figureList()   { return this._FIGLIST.slice(); }

  // ─── Internos ─────────────────────────────────────────────
  _noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  _thin(c) { return { style: BorderStyle.SINGLE, size: 4, color: c || this.T.LINE }; }

  /**
   * Parsea markdown inline:
   *   ***texto*** -> negrita+cursiva
   *   **texto**   -> negrita
   *   *texto*     -> cursiva
   *   `codigo`    -> monoespaciado
   *   [texto](url)-> hipervínculo (devuelve ExternalHyperlink en lugar de TextRun)
   */
  _runs(text, opt = {}) {
    const str = String(text);
    const re = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|`[\s\S]+?`|\[[^\]\n]+\]\((?:[^()\n]|\([^)\n]*\))+\))/g;
    const out = [];
    let last = 0, m;

    const makeRun = (txt, styles = {}) => new TextRun({
      text: txt,
      bold: styles.bold || opt.bold,
      italics: styles.italics || opt.italics,
      font: styles.font || opt.font || this.T.BFONT,
      size: opt.size || 21,
      color: styles.color || opt.color || this.T.BODY,
      underline: styles.underline,
    });

    while ((m = re.exec(str)) !== null) {
      if (m.index > last) out.push(makeRun(str.slice(last, m.index)));
      const token = m[0];
      if (token.startsWith('***') && token.endsWith('***')) {
        out.push(makeRun(token.slice(3, -3), { bold: true, italics: true }));
      } else if (token.startsWith('**') && token.endsWith('**')) {
        out.push(makeRun(token.slice(2, -2), { bold: true }));
      } else if (token.startsWith('*') && token.endsWith('*')) {
        out.push(makeRun(token.slice(1, -1), { italics: true }));
      } else if (token.startsWith('`') && token.endsWith('`')) {
        out.push(makeRun(token.slice(1, -1), {
          font: this.T.MFONT, color: this.T.DEEP,
        }));
      } else if (token.startsWith('[')) {
        const match = token.match(/^\[([^\]]+)\]\((.+)\)$/);
        if (match) {
          out.push(new ExternalHyperlink({
            children: [new TextRun({
              text: match[1], font: this.T.BFONT, size: opt.size || 21,
              color: this.T.ACCENT, underline: { type: 'single' }
            })],
            link: match[2]
          }));
        }
      }
      last = re.lastIndex;
    }
    if (last < str.length) out.push(makeRun(str.slice(last)));
    return out;
  }

  // ─── Texto ────────────────────────────────────────────────
  /** Párrafo justificado con markdown inline. */
  rich(text, opt = {}) {
    return new Paragraph({
      alignment: opt.align || AlignmentType.JUSTIFIED,
      spacing: { before: opt.before ?? 0, after: opt.after ?? 160, line: 288 },
      children: this._runs(text, opt)
    });
  }

  /** Párrafo simple, alineado a la izquierda. */
  p(text, opt = {}) {
    return this.rich(text, { align: AlignmentType.LEFT, ...opt });
  }

  /** Título de sección principal. */
  h1(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      keepNext: true,
      spacing: { before: 420, after: 40 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: this.T.ACCENT, space: 6 } },
      children: [new TextRun({
        text, font: this.T.HFONT, size: 30, bold: true, color: this.T.INK
      })]
    });
  }

  /** Subtítulo. */
  h2(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      keepNext: true,
      spacing: { before: 300, after: 100 },
      children: [new TextRun({
        text, font: this.T.HFONT, size: 24, bold: true, color: this.T.DEEP
      })]
    });
  }

  /** Sub-subtítulo (nuevo). */
  h3(text) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_3,
      keepNext: true,
      spacing: { before: 240, after: 80 },
      children: [new TextRun({
        text, font: this.T.HFONT, size: 21, bold: true, italics: true, color: this.T.DEEP
      })]
    });
  }

  /** Etiqueta en versalitas. */
  label(text) {
    return new Paragraph({
      keepNext: true,
      spacing: { before: 60, after: 60 },
      children: [new TextRun({
        text, font: this.T.BFONT, size: 15, bold: true, color: this.T.ACCENT,
        allCaps: true, characterSpacing: 30
      })]
    });
  }

  spacer(h) {
    return new Paragraph({ spacing: { after: h || 160 }, children: [] });
  }

  pageBreak() {
    return new Paragraph({ children: [new PageBreak()] });
  }

  bullets(items) {
    return items.map(t => new Paragraph({
      numbering: { reference: 'kit-vinetas', level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 100, line: 276 },
      children: this._runs(t)
    }));
  }

  numbered(items) {
    return items.map(t => new Paragraph({
      numbering: { reference: 'kit-pasos', level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 100, line: 276 },
      children: this._runs(t)
    }));
  }

  // ─── Tablas ───────────────────────────────────────────────
  cell(text, o = {}) {
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
          font: o.mono ? this.T.MFONT : this.T.BFONT,
          size: o.size || (o.head ? 18 : 19),
          bold: o.head || o.bold,
          color: o.head ? 'FFFFFF' : (o.color || this.T.BODY)
        })]
      }))
    });
  }

  /**
   * table(head, rows, widths, opts)
   *   opts.mono      : array de índices de columna monoespaciadas
   *   opts.boldFirst : resaltar en negrita la primera columna
   *   opts.headerFill: color de fondo del encabezado (por defecto T.DEEP)
   */
  table(head, rows, widths, opts = {}) {
    if (!Array.isArray(head)) throw new TypeError('table(): head debe ser un array');
    if (!Array.isArray(rows)) throw new TypeError('table(): rows debe ser un array');
    if (!Array.isArray(widths)) throw new TypeError('table(): widths debe ser un array');
    if (head.length !== widths.length) {
      throw new Error(`table(): head tiene ${head.length} columnas pero widths tiene ${widths.length}`);
    }
    const sum = widths.reduce((a, b) => a + b, 0);
    if (sum !== this.W) throw new Error(`table(): los anchos suman ${sum} y deben sumar ${this.W}`);

    rows.forEach((r, i) => {
      if (!Array.isArray(r)) throw new TypeError(`table(): la fila ${i} no es un array`);
      if (r.length !== head.length) {
        throw new Error(`table(): la fila ${i} tiene ${r.length} columnas, esperadas ${head.length}`);
      }
    });

    const mono = opts.mono || [];
    const trs = [new TableRow({
      tableHeader: true,
      children: head.map((t, i) => this.cell(t, {
        w: widths[i], head: true, fill: opts.headerFill || this.T.DEEP
      }))
    })];
    rows.forEach((r, ri) => trs.push(new TableRow({
      children: r.map((t, i) => this.cell(t, {
        w: widths[i],
        fill: ri % 2 ? this.T.SOFT : 'FFFFFF',
        mono: mono.includes(i),
        bold: opts.boldFirst && i === 0
      }))
    })));
    return new Table({
      width: { size: this.W, type: WidthType.DXA },
      columnWidths: widths,
      borders: {
        top: this._thin(), bottom: this._thin(),
        left: this._thin(), right: this._thin(),
        insideHorizontal: this._thin(), insideVertical: this._thin()
      },
      rows: trs
    });
  }

  // ─── Código ───────────────────────────────────────────────
  /**
   * code(lines, caption, opts)
   *   opts.lang       : 'js' | 'py' | 'bash' | 'sql' | 'json' | null (por defecto null)
   *   opts.allowSplit : true para bloques largos que pueden partirse entre páginas
   */
  code(lines, caption, opts = {}) {
    if (typeof opts === 'boolean') opts = { allowSplit: opts }; // compat v1
    const allowSplit = !!opts.allowSplit;
    const lang = opts.lang || null;

    const inner = [];
    if (caption) {
      inner.push(new Paragraph({
        keepNext: !allowSplit,
        shading: { type: ShadingType.CLEAR, fill: this.T.CODEBAR, color: 'auto' },
        spacing: { before: 0, after: 120 },
        indent: { left: 120, right: 120 },
        children: [new TextRun({
          text: '  ' + caption, font: this.T.BFONT, size: 15, bold: true,
          color: this.T.DEEP, allCaps: true, characterSpacing: 30
        })]
      }));
    }

    lines.forEach(l => {
      const tokens = lang ? highlight(String(l), lang) : [{ text: String(l), color: null }];
      inner.push(new Paragraph({
        spacing: { before: 0, after: 0, line: 230 },
        indent: { left: 180, right: 120 },
        children: tokens.map(t => new TextRun({
          text: t.text,
          font: this.T.MFONT, size: 16,
          color: t.color || this.T.INK
        }))
      }));
    });

    return [
      new Table({
        width: { size: this.W, type: WidthType.DXA },
        columnWidths: [this.W],
        borders: {
          top: this._thin(), bottom: this._thin(),
          left: { style: BorderStyle.SINGLE, size: 18, color: this.T.DEEP },
          right: this._thin(),
          insideHorizontal: this._noBorder, insideVertical: this._noBorder
        },
        rows: [new TableRow({
          cantSplit: !allowSplit,
          children: [new TableCell({
            width: { size: this.W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: this.T.CODEBG, color: 'auto' },
            margins: { top: 120, bottom: 140, left: 0, right: 0 },
            children: inner
          })]
        })]
      }),
      this.spacer(220)
    ];
  }

  // ─── Figuras ──────────────────────────────────────────────
  /**
   * figure(title, opts)
   *   opts.height       : altura del marco en DXA (default 3000)
   *   opts.imagePath    : ruta a archivo de imagen (png/jpg/gif/bmp)
   *   opts.imageBuffer  : Buffer con la imagen (alternativa a imagePath)
   *   opts.imageWidth   : ancho de la imagen en píxeles
   *   opts.imageHeight  : alto de la imagen en píxeles
   */
  figure(title, opts = {}) {
    if (typeof opts === 'number') opts = { height: opts }; // compat v1
    const H = opts.height || 3000;
    this._FIGN += 1;
    const num = this._FIGN;
    this._FIGLIST.push([String(num), title]);

    const inner = [new Paragraph({
      keepNext: true,
      shading: { type: ShadingType.CLEAR, fill: this.T.DEEP, color: 'auto' },
      spacing: { before: 0, after: 0, line: 300 },
      children: [new TextRun({
        text: '   EVIDENCIA · ' + title.toUpperCase(),
        font: this.T.BFONT, size: 15, bold: true, color: 'FFFFFF', characterSpacing: 26
      })]
    })];

    // Imagen real o placeholder
    const hasImage = opts.imagePath || opts.imageBuffer;
    if (hasImage) {
      const imgData = opts.imageBuffer || fs.readFileSync(opts.imagePath);
      const ext = (opts.imagePath ? path.extname(opts.imagePath) : '.png').slice(1).toLowerCase();
      const typeMap = { jpg: 'jpg', jpeg: 'jpg', png: 'png', gif: 'gif', bmp: 'bmp' };
      // Si el autor fijó `height` (alto del marco en DXA) y no dio medidas de
      // imagen, se deriva el alto en píxeles (1 px ≈ 15 DXA) para respetarlo.
      const derivedH = opts.height ? Math.max(120, Math.round(opts.height / 15) - 24) : 350;
      const imgW = opts.imageWidth || 500;
      const imgH = opts.imageHeight || derivedH;
      inner.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [new ImageRun({
          data: imgData,
          transformation: { width: imgW, height: imgH },
          type: typeMap[ext] || 'png'
        })]
      }));
    } else {
      const blanks = Math.max(2, Math.round(H / 260));
      for (let i = 0; i < blanks; i++) {
        inner.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0, line: 260 },
          children: i === Math.floor(blanks / 2)
            ? [new TextRun({
                text: '[ Reemplaza este marco por la captura de pantalla ]',
                font: this.T.BFONT, size: 18, italics: true, color: '9AAAB2'
              })]
            : []
        }));
      }
    }

    return [
      new Table({
        width: { size: this.W, type: WidthType.DXA },
        columnWidths: [this.W],
        borders: {
          top: this._thin(), bottom: this._thin(),
          left: this._thin(), right: this._thin(),
          insideHorizontal: this._noBorder, insideVertical: this._noBorder
        },
        rows: [new TableRow({
          cantSplit: true,
          children: [new TableCell({
            width: { size: this.W, type: WidthType.DXA },
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
          new TextRun({
            text: 'Figura ' + num + '. ', font: this.T.BFONT, size: 17,
            color: this.T.GREY, italics: true, bold: true
          }),
          new TextRun({
            text: title, font: this.T.BFONT, size: 17,
            color: this.T.GREY, italics: true
          })
        ]
      })
    ];
  }

  figureIndex() { return { __kitFigureIndex: true }; }

  figureIndexHeading(titulo) {
    return new Paragraph({
      keepNext: true,
      spacing: { before: 400, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: this.T.ACCENT, space: 6 } },
      children: [new TextRun({
        text: titulo || 'Índice de figuras', font: this.T.HFONT, size: 30,
        bold: true, color: this.T.INK
      })]
    });
  }

  // ─── Notas y destacados ──────────────────────────────────
  note(title, text) {
    return [
      new Table({
        width: { size: this.W, type: WidthType.DXA },
        columnWidths: [this.W],
        borders: {
          top: this._noBorder, bottom: this._noBorder, right: this._noBorder,
          left: { style: BorderStyle.SINGLE, size: 18, color: this.T.ACCENT },
          insideHorizontal: this._noBorder, insideVertical: this._noBorder
        },
        rows: [new TableRow({
          cantSplit: true,
          children: [new TableCell({
            width: { size: this.W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: this.T.NOTEBG, color: 'auto' },
            margins: { top: 140, bottom: 140, left: 180, right: 160 },
            children: [
              new Paragraph({
                keepNext: true, spacing: { before: 0, after: 60 },
                children: [new TextRun({
                  text: title, font: this.T.BFONT, size: 18,
                  bold: true, color: this.T.ACCENT
                })]
              }),
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 0, after: 0, line: 264 },
                children: this._runs(text, { size: 19 })
              })
            ]
          })]
        })]
      }),
      this.spacer(220)
    ];
  }

  /**
   * callout(type, title, text)
   *   type: 'info' | 'warning' | 'danger' | 'success' | 'tip'
   */
  callout(type, title, text) {
    const presets = {
      info:    { color: '2E86AB', bg: 'E8F4F8', icon: 'ℹ' },
      warning: { color: 'C47F15', bg: 'FFF4E0', icon: '⚠' },
      danger:  { color: 'C0392B', bg: 'FDECEA', icon: '✕' },
      success: { color: '27AE60', bg: 'E8F8F0', icon: '✓' },
      tip:     { color: '7E57C2', bg: 'F3EEFA', icon: '★' }
    };
    const p = presets[type] || presets.info;

    return [
      new Table({
        width: { size: this.W, type: WidthType.DXA },
        columnWidths: [this.W],
        borders: {
          top: this._noBorder, bottom: this._noBorder, right: this._noBorder,
          left: { style: BorderStyle.SINGLE, size: 24, color: p.color },
          insideHorizontal: this._noBorder, insideVertical: this._noBorder
        },
        rows: [new TableRow({
          cantSplit: true,
          children: [new TableCell({
            width: { size: this.W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: p.bg, color: 'auto' },
            margins: { top: 140, bottom: 140, left: 180, right: 160 },
            children: [
              new Paragraph({
                keepNext: true, spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: p.icon + '  ' + title,
                    font: this.T.BFONT, size: 19, bold: true, color: p.color
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 0, after: 0, line: 264 },
                children: this._runs(text, { size: 19 })
              })
            ]
          })]
        })]
      }),
      this.spacer(220)
    ];
  }

  /**
   * citation(text, source)
   *   Cita en bloque con borde lateral y atribución.
   */
  citation(text, source) {
    return new Paragraph({
      indent: { left: 720, right: 720 },
      spacing: { before: 140, after: 140, line: 276 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: this.T.ACCENT, space: 10 } },
      children: [
        ...this._runs(`"${text}"`, { italics: true, size: 20, color: this.T.DEEP }),
        ...(source ? [
          new TextRun({ text: '  — ', font: this.T.BFONT, size: 18, color: this.T.GREY }),
          new TextRun({ text: source, font: this.T.BFONT, size: 18, color: this.T.GREY, italics: true })
        ] : [])
      ]
    });
  }

  /**
   * link(text, url)
   *   Devuelve un ExternalHyperlink listo para incluir en un Paragraph como child.
   *   También puedes usar [texto](url) dentro de rich() o p().
   */
  link(text, url) {
    return new ExternalHyperlink({
      children: [new TextRun({
        text, font: this.T.BFONT, size: 21,
        color: this.T.ACCENT, underline: { type: 'single' }
      })],
      link: url
    });
  }

  // ─── Portada ──────────────────────────────────────────────
  cover(o) {
    const out = [this.spacer(500)];
    if (o.institucion) out.push(new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({
        text: o.institucion.toUpperCase(), font: this.T.BFONT, size: 17,
        bold: true, color: this.T.ACCENT, characterSpacing: 44
      })]
    }));
    if (o.linea) out.push(new Paragraph({
      spacing: { after: 700 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: this.T.LINE, space: 8 } },
      children: [new TextRun({ text: o.linea, font: this.T.BFONT, size: 19, color: this.T.GREY })]
    }));
    out.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({
        text: o.titulo, font: this.T.HFONT, size: 72, bold: true, color: this.T.INK
      })]
    }));
    if (o.subtitulo) out.push(new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({
        text: o.subtitulo, font: this.T.HFONT, size: 34, color: this.T.DEEP
      })]
    }));
    if (o.resumen) out.push(new Paragraph({
      spacing: { after: 1200 },
      children: [new TextRun({
        text: o.resumen, font: this.T.BFONT, size: 21, italics: true, color: this.T.GREY
      })]
    }));
    if (o.datos && o.datos.length) {
      out.push(this.table(['Campo', 'Detalle'], o.datos, [2900, this.W - 2900], { boldFirst: true }));
    }
    if (o.stats && o.stats.length) {
      out.push(this.spacer(560));
      const n = o.stats.length;
      const cw = Math.floor(this.W / n);
      const widths = Array(n).fill(cw);
      widths[n - 1] = this.W - cw * (n - 1);
      out.push(new Table({
        width: { size: this.W, type: WidthType.DXA },
        columnWidths: widths,
        borders: {
          top: this._noBorder, bottom: this._noBorder,
          left: this._noBorder, right: this._noBorder,
          insideHorizontal: this._noBorder,
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: this.T.LINE }
        },
        rows: [new TableRow({
          children: o.stats.map(([num, lab], i) => new TableCell({
            width: { size: widths[i], type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER, spacing: { after: 0 },
                children: [new TextRun({
                  text: String(num), font: this.T.HFONT, size: 40,
                  bold: true, color: this.T.DEEP
                })]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER, spacing: { after: 0 },
                children: [new TextRun({
                  text: lab, font: this.T.BFONT, size: 16,
                  color: this.T.GREY, characterSpacing: 20
                })]
              })
            ]
          }))
        })]
      }));
    }
    return out;
  }

  // ─── Índices ──────────────────────────────────────────────
  toc(titulo) {
    return [
      new Paragraph({
        keepNext: true,
        spacing: { after: 60 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: this.T.ACCENT, space: 6 } },
        children: [new TextRun({
          text: titulo || 'Contenido', font: this.T.HFONT, size: 30,
          bold: true, color: this.T.INK
        })]
      }),
      new Paragraph({
        spacing: { before: 100, after: 200 },
        children: [new TextRun({
          text: 'Índice automático: al abrir el archivo en Word, haz clic sobre él y pulsa F9 para rellenarlo.',
          font: this.T.BFONT, size: 17, italics: true, color: this.T.GREY
        })]
      }),
      new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-3' })
    ];
  }

  // ─── Build ────────────────────────────────────────────────
  /**
   * build({ cover, body, meta, out, margins, orientation })
   *   orientation : 'portrait' | 'landscape' (default 'portrait')
   */
  build({ cover: portada, body, meta = {}, out, margins, orientation = 'portrait' }) {
    const idx = body.findIndex(e => e && e.__kitFigureIndex);
    if (idx >= 0) {
      body.splice(idx, 1, this.table(
        ['N.º', 'Descripción de la figura'],
        this._FIGLIST.length ? this._FIGLIST : [['—', 'Sin figuras en este documento']],
        [900, this.W - 900]
      ));
    }

    const defaultMargins = {
      top: 1134, bottom: 1134, left: 1134, right: 1134, header: 620, footer: 560
    };
    const pageMargins = margins || defaultMargins;
    const isLandscape = orientation === 'landscape';

    const pageSetup = {
      page: {
        size: {
          width:  isLandscape ? 16838 : 11906,
          height: isLandscape ? 11906 : 16838,
          orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT
        },
        margin: pageMargins
      }
    };

    const header = new Header({
      children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: this.T.ACCENT, space: 4 } },
        children: [
          new TextRun({
            text: meta.headerIzq || '', font: this.T.BFONT, size: 15,
            color: this.T.GREY, characterSpacing: 16
          }),
          new TextRun({
            text: '\t' + (meta.headerDer || ''), font: this.T.BFONT, size: 15, color: this.T.GREY
          })
        ]
      })]
    });

    const footer = new Footer({
      children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({
            text: meta.footerIzq || '', font: this.T.BFONT, size: 15, color: this.T.GREY
          }),
          new TextRun({ text: '\tPágina ', font: this.T.BFONT, size: 15, color: this.T.GREY }),
          new TextRun({
            children: [PageNumber.CURRENT], font: this.T.BFONT, size: 15,
            bold: true, color: this.T.DEEP
          }),
          new TextRun({ text: ' de ', font: this.T.BFONT, size: 15, color: this.T.GREY }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES], font: this.T.BFONT, size: 15, color: this.T.GREY
          })
        ]
      })]
    });

    const sections = [];
    if (portada && portada.length) {
      // Portada: sin headers ni footers
      sections.push({ properties: pageSetup, children: portada });
    }
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
        default: { document: { run: { font: this.T.BFONT, size: 21, color: this.T.BODY } } },
        paragraphStyles: [
          {
            id: 'Caption', name: 'Caption', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: this.T.BFONT, size: 17, italics: true, color: this.T.GREY }
          },
          {
            id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: this.T.HFONT, size: 30, bold: true, color: this.T.INK }
          },
          {
            id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: this.T.HFONT, size: 24, bold: true, color: this.T.DEEP }
          },
          {
            id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: this.T.HFONT, size: 21, bold: true, italics: true, color: this.T.DEEP }
          }
        ]
      },
      numbering: {
        config: [
          {
            reference: 'kit-vinetas', levels: [{
              level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: this.T.ACCENT } }
            }]
          },
          {
            reference: 'kit-pasos', levels: [{
              level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 420, hanging: 300 } }, run: { bold: true, color: this.T.DEEP } }
            }]
          }
        ]
      },
      sections
    });

    const figCount = this._FIGN;
    return Packer.toBuffer(doc).then(b => {
      fs.writeFileSync(out, b);
      console.log('Escrito: ' + out + ' (' + figCount + ' figuras)');
      return out;
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Instancia legacy (compatibilidad hacia atrás con v1)
//
// AVISO: las funciones exportadas comparten esta única instancia, así que el
// tema, el ancho de contenido y la numeración de figuras persisten entre
// documentos dentro de la misma ejecución. Para generar varios documentos sin
// contaminación usa `new Report()`.
// ─────────────────────────────────────────────────────────────
const _default = new Report();

// Wrapper que delega cada función legacy a la instancia global
const _legacy = {
  theme:        (...a) => _default.theme(...a),
  THEMES,
  contentWidth: (...a) => _default.contentWidth(...a),
  p:            (...a) => _default.p(...a),
  rich:         (...a) => _default.rich(...a),
  h1:           (...a) => _default.h1(...a),
  h2:           (...a) => _default.h2(...a),
  h3:           (...a) => _default.h3(...a),
  label:        (...a) => _default.label(...a),
  spacer:       (...a) => _default.spacer(...a),
  pageBreak:    (...a) => _default.pageBreak(...a),
  bullets:      (...a) => _default.bullets(...a),
  numbered:     (...a) => _default.numbered(...a),
  table:        (...a) => _default.table(...a),
  cell:         (...a) => _default.cell(...a),
  code:         (...a) => _default.code(...a),
  figure:       (...a) => _default.figure(...a),
  figureIndex:  (...a) => _default.figureIndex(...a),
  figureIndexHeading: (...a) => _default.figureIndexHeading(...a),
  resetFigures: (...a) => _default.resetFigures(...a),
  figureList:   (...a) => _default.figureList(...a),
  note:         (...a) => _default.note(...a),
  callout:      (...a) => _default.callout(...a),
  citation:     (...a) => _default.citation(...a),
  link:         (...a) => _default.link(...a),
  cover:        (...a) => _default.cover(...a),
  toc:          (...a) => _default.toc(...a),
  build:        (...a) => _default.build(...a),
  docx:         d,
  Report        // expuesta para quien quiera usar la API moderna
};

module.exports = _legacy;