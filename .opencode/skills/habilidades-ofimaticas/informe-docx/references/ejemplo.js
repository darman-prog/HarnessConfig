/**
 * ejemplo.js — informe mínimo pero completo usando el kit.
 * Cópialo como plantilla de arranque y reemplaza el contenido.
 *
 *   cp references/ejemplo.js build.js
 *   node build.js
 */

const path = require('path');
const K = require(path.join(__dirname, '..', 'scripts', 'kit'));

K.theme('institucional');   // institucional | sobrio | campo | academico

// ── Portada ──────────────────────────────────────────────────
const portada = K.cover({
  institucion: 'Universidad Ejemplo',
  linea: 'Informe técnico  ·  Nombre de la asignatura',
  titulo: 'PRÁCTICA 3',
  subtitulo: 'Título largo y descriptivo de lo que se hizo',
  resumen: 'Una frase que resume el alcance del trabajo.',
  datos: [
    ['Estudiante', 'Nombre Apellido'],
    ['Código', '000000'],
    ['Asignatura', 'Nombre de la asignatura'],
    ['Profesor', '[ Nombre del profesor ]'],
    ['Fecha', 'Mes de año']
  ],
  stats: [['12', 'equipos'], ['04', 'pruebas'], ['03', 'servicios']]
});

// ── Cuerpo ───────────────────────────────────────────────────
const body = [];
const A = (...x) => x.flat().forEach(e => body.push(e));

A(K.toc());
A(K.figureIndexHeading());
A(K.figureIndex());           // se rellena solo al construir
A(K.pageBreak());

A(K.h1('1. Introducción y objetivos'));
A(K.rich('Párrafo de contexto con algún término en **negrita** para destacarlo.'));
A(K.label('Objetivos'));
A(K.bullets([
  'Primer objetivo concreto y verificable.',
  'Segundo objetivo, también con **énfasis** donde haga falta.'
]));

A(K.h1('2. Desarrollo'));
A(K.h2('2.1 Parámetros usados'));
A(K.table(
  ['Parámetro', 'Valor', 'Justificación'],
  [
    ['Tamaño de muestra', '120', 'Suficiente para el margen de error buscado'],
    ['Duración', '4 semanas', 'Cubre un ciclo completo del proceso']
  ],
  [2600, 1800, 5430],        // debe sumar 9830
  { mono: [1], boldFirst: true }
));
A(K.spacer(220));

A(K.h2('2.2 Comandos ejecutados'));
A(K.code([
  '$ comando --opcion valor',
  '$ otro-comando | grep resultado'
], 'Terminal · equipo principal'));

A(K.rich('Texto explicando qué muestra la captura siguiente y por qué importa.'));
A(K.figure('Resultado del comando en el equipo principal', 2600));

A(K.note('Detalle a tener en cuenta',
  'Las notas sirven para advertencias, supuestos o limitaciones. Úsalas con moderación: '
  + 'dos o tres por documento, no una por sección.'));

A(K.h1('3. Conclusiones'));
A(K.bullets([
  'Qué se logró, con evidencia concreta.',
  'Qué se aprendió, en términos del concepto y no del procedimiento.'
]));

// ── Construir ────────────────────────────────────────────────
K.build({
  cover: portada,
  body,
  meta: {
    titulo: 'Práctica 3',
    autor: 'Nombre Apellido',
    headerIzq: 'Práctica 3 · Título corto',
    headerDer: 'Nombre Apellido · 000000',
    footerIzq: 'Asignatura · Universidad'
  },
  out: '/mnt/user-data/outputs/Apellido_Nombre_Practica3.docx'
});
