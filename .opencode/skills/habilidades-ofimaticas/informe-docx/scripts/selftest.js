/**
 * selftest.js — smoke test del kit de maquetacion DOCX.
 *
 * Verifica sin infraestructura de tests: exports, validacion de table(),
 * markdown inline, numeracion de figuras y build completo con imagen real.
 *
 *   node scripts/selftest.js
 *
 * Requiere el paquete `docx` (harness global). Si no resuelve, se anade el
 * node_modules global del usuario a la resolucion de modulos.
 */

const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');

try {
  require.resolve('docx');
} catch {
  // Harness global por defecto en Windows/macOS/Linux segun homedir.
  const globalNM = path.join(os.homedir(), '.config', 'opencode', 'node_modules');
  process.env.NODE_PATH = [process.env.NODE_PATH, globalNM].filter(Boolean).join(path.delimiter);
  Module._initPaths();
}

const K = require('./kit');

// PNG 1x1 minimo y valido para ImageRun.
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function main() {
  // 1. Superficie publica completa (v1 + v2).
  const need = [
    'theme', 'THEMES', 'contentWidth', 'p', 'rich', 'h1', 'h2', 'h3', 'label',
    'spacer', 'pageBreak', 'bullets', 'numbered', 'table', 'cell', 'code',
    'figure', 'figureIndex', 'figureIndexHeading', 'resetFigures', 'figureList',
    'note', 'callout', 'citation', 'link', 'cover', 'toc', 'build', 'docx', 'Report'
  ];
  assert.deepEqual(need.filter((k) => !(k in K)), [], 'faltan exports en el kit');

  // 2. table() valida suma de anchos y numero de columnas.
  assert.throws(() => K.table(['a'], [['b']], [1]), /suman/);
  assert.throws(
    () => K.table(['a', 'b'], [['x']], [4819, K.contentWidth() - 4819]),
    /columnas/
  );

  // 3. Markdown inline, incluida URL con parentesis.
  {
    const r = new K.Report();
    const runs = r._runs('**b** *i* `c` ***bi*** [x](https://e.com/a(1))');
    assert.ok(runs.some((x) => x.constructor.name === 'ExternalHyperlink'), 'sin hipervinculo');
    assert.ok(runs.length >= 9, 'markdown inline incompleto');
  }

  // 4. Documento completo de principio a fin.
  K.theme('institucional');
  const cover = K.cover({
    institucion: 'Test',
    titulo: 'Smoke',
    datos: [['A', 'B']]
  });

  const body = [];
  const A = (...x) => x.flat().forEach((e) => body.push(e));
  A(K.toc());
  A(K.figureIndexHeading(), K.figureIndex());
  A(K.h1('1. Seccion'), K.h2('1.1 Sub'), K.h3('1.1.1 Sub sub'));
  A(K.rich('Texto **negrita**, *cursiva*, `codigo` y ***ambos***.'));
  A(K.bullets(['uno', 'dos']));
  A(K.numbered(['paso 1', 'paso 2']));
  A(K.table(['A', 'B'], [['1', '2'], ['3', '4']], [4819, 4819], { mono: [1], boldFirst: true }));
  A(K.code(['const x = 1;', 'console.log(x);'], 'Ejemplo JS', { lang: 'js' }));
  A(K.figure('Marco vacio', 2600));
  A(K.figure('Imagen real', { imageBuffer: PNG_1x1, imageWidth: 40, imageHeight: 40 }));
  A(K.note('Nota', 'Texto de la nota.'));
  A(K.callout('warning', 'Cuidado', 'Esto es un aviso.'));
  A(K.citation('Una cita', 'Autor'));
  A(K.link('Enlace', 'https://example.com'));

  assert.equal(K.figureList().length, 2, 'numeracion de figuras incorrecta');

  const out = path.join(os.tmpdir(), 'kit-selftest-' + Date.now() + '.docx');
  await K.build({ cover, body, meta: { titulo: 'Smoke' }, out });
  assert.ok(fs.existsSync(out) && fs.statSync(out).size > 0, 'no escribio el .docx');
  fs.rmSync(out, { force: true });

  console.log('OK - smoke test del kit');
}

main().catch((e) => {
  console.error('FAIL: ' + e.message);
  process.exit(1);
});
