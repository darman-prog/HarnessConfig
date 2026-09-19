---
name: informe-docx
description: Genera documentos de Word (.docx) con calidad editorial usando Node.js + docx-js y el kit de maquetacion scripts/kit.js — portada, indice, tablas, bloques de codigo, marcos de evidencia con pie de figura numerado, notas destacadas, encabezado y pie con paginacion. Sub-ruta especializada de habilidades-ofimaticas (activacion manual exclusiva). Usar cuando el usuario invoque habilidades-ofimaticas/ofimatica y pida un informe Word tecnico o academico complejo. No usar para presentaciones (.pptx), PDF desde HTML ni documentos Word simples (esa ruta es python-docx).
---

# Informes en Word con calidad editorial (ruta docx-js)

Esta sub-skill produce `.docx` reconstruyendolos con `docx-js` a partir de un kit de
maquetacion ya resuelto (`scripts/kit.js`). Es la ruta para **informes complejos**:
portada, indice, tablas, figuras, bloques de codigo y control editorial. Para
documentos Word simples o rapidos usa la ruta `python-docx` de la skill coordinadora
(`templates/generar-docx.py`) — ver enrutamiento en `../SKILL.md`.

## Flujo de trabajo

1. **Consigue el contenido.** Si hay un `.docx` de origen, leelo con
   `pandoc -t markdown archivo.docx` si pandoc esta disponible; si no, recoge el
   material de la conversacion o pregunta por lo esencial.
2. **Audita antes de maquetar.** Revisa el contenido con ojo critico y anota lo que
   encuentres (ver *Auditoria de contenido* mas abajo). Un documento bonito con
   referencias cruzadas rotas sigue estando mal.
3. **Planea la estructura.** Orden de secciones antes de escribir codigo. Las
   conclusiones van al final, siempre; los anexos despues de ellas.
4. **Escribe un `build.js`** partiendo de `references/ejemplo.js` y usando los
   helpers del kit. Coloca `build.js` en una carpeta de trabajo temporal del
   proyecto (no dentro de la skill).
5. **Renderiza y miralo.** Este paso no es opcional: la mitad de los defectos de
   maquetacion solo se ven en el render. En Windows:
   ```powershell
   node build.js
   # Validacion visual (opcional, requiere LibreOffice instalado):
   soffice --headless --convert-to pdf salida.docx --outdir .
   # Si hay pdftoppm (poppler):
   pdftoppm -jpeg -r 70 salida.pdf pg
   ```
   Si `soffice`/`pdftoppm` no estan instalados, avisale al usuario en una linea y
   entrega el `.docx` sin preview renderizado. Abre el `.docx` resultante o las
   imagenes `pg-*.jpg` con la herramienta de lectura. Busca: marcos partidos,
   titulos al pie sin contenido debajo, paginas casi vacias, columnas descuadradas.
6. **Valida** la apertura del archivo (Word/LibreOffice) y la coherencia del kit:
   anchos de tabla correctos, numeracion de figuras consecutiva, indices coherentess.
7. **Entrega** el `.docx` y **enumera al usuario** los cambios de diseño, los de
   organizacion y —por separado— las decisiones de contenido que debe confirmar el.

## Dependencias

- **Node.js** con el paquete npm `docx`, instalado como dependencia del harness
  global (`C:\Users\damez\.config\opencode\node_modules`). No copies `node_modules`
  al proyecto. Si `require('docx')` falla al ejecutar desde el proyecto destino,
  instala localmente en la carpeta de trabajo temporal: `npm install docx`.
- Opcional para validacion visual: LibreOffice (`soffice`), poppler (`pdftoppm`).
- Resolucion de modulos: si `build.js` corre dentro del proyecto y `docx` no
  resuelve, usa `require.resolve` o define `NODE_PATH` apuntando al
  `node_modules` del harness global.

## El kit

`scripts/kit.js` exporta todo lo necesario. Requirielo por ruta relativa o absoluta
desde tu `build.js`. Lee `references/ejemplo.js` para ver un documento completo de
principio a fin; es la plantilla de arranque.

| Helper | Para que |
|---|---|
| `theme(nombre)` | `institucional` (defecto), `sobrio`, `campo`, `academico` |
| `cover({...})` | Portada con institucion, titulo, tabla de datos y cifras destacadas |
| `toc()` | Indice de contenido (campo real de Word, se rellena con F9) |
| `figureIndexHeading()` + `figureIndex()` | Indice de figuras estatico, se rellena solo |
| `h1` `h2` `label` | Jerarquia de titulos y etiquetas en versalitas |
| `rich(texto)` | Parrafo justificado; admite `**negrita**` en linea |
| `bullets` `numbered` | Listas con vineta o numeradas |
| `table(head, rows, widths, opts)` | Tabla con cabecera de color y filas alternas |
| `code(lineas, titulo, allowSplit)` | Bloque de consola con el titulo dentro del marco |
| `figure(titulo, alto)` | Marco de evidencia + pie numerado automaticamente |
| `note(titulo, texto)` | Aviso, supuesto o limitacion |
| `build({cover, body, meta, out})` | Ensambla y escribe el archivo |

### Reglas del kit que no debes romper

- **Los anchos de `table()` deben sumar exactamente `contentWidth()`** (9638 DXA en
  A4 con margenes 20 mm, valor por defecto de este kit). El kit lanza un error si no
  cuadran, para que no descubras el descuadre en el render.
- **`code()` recibe un array de lineas**, nunca un string con `\n`. Mantenlas por
  debajo de ~100 caracteres o se desbordan del marco.
- Pasa **`allowSplit: true` en `code()` solo para bloques largos** de anexo que no
  caben en una pagina. Para todo lo demas, dejalo indivisible.
- **Elige el alto de `figure()` segun la captura**: ~2600 para salida de consola,
  ~3000 para una ventana, ~3800 para pantalla completa. Un marco demasiado bajo
  obliga a encoger la captura hasta que no se lea.
- El numero de figura es **fijo, no un campo SEQ**: se ve correcto aunque el usuario
  nunca actualice campos al abrir el archivo. El indice de figuras es estatico: si
  reordenas figuras se renumeran solas al reconstruir, pero no arrastres numeros
  escritos a mano en el texto.
- Las referencias en prosa a una figura ("ver figura 7") verificalas contra el orden
  final. `figureList()` te devuelve la lista para comprobarlo.

## Paleta y temas

El kit define sus propios temas (`institucional`, `sobrio`, `campo`, `academico`)
internamente consistentes. NO mezcles la paleta contextual de la skill coordinadora
(PALETTE de python-docx) con los temas del kit: elige una ruta y respeta su sistema
cromatico completo. Si el usuario da colores de marca, personaliza el tema con
`theme({ INK, DEEP, ACCENT, ... })` manteniendo la disciplina de un solo acento.

## Principios de maquetacion

**Que nada se parta.** Un marco de evidencia con la barra de titulo en una pagina y
el cuerpo en la siguiente es el defecto que mas delata un documento mal armado. Los
marcos y bloques de consola son una sola fila de tabla con `cantSplit`, y el titulo
del bloque va *dentro* del marco.

**Que los titulos no queden huerfanos.** Todos los encabezados llevan `keepNext`.

**Jerarquia por tipografia, no por cajas de color.** Un titulo grande en serif y una
regla fina de acento comunican mejor que un rectangulo de color de fondo.

**Un solo acento.** El tema define un color de acento y uno profundo. No añadas un
tercero: la disciplina cromatica hace que el documento se lea como un sistema.

**Columnas proporcionales al contenido.** Calcula los anchos mirando el contenido
mas largo de cada columna.

**Espacio en blanco como estructura.** Los `spacer()` despues de tablas y bloques
existen por eso.

## Auditoria de contenido

Antes de maquetar, revisa y reporta al usuario:

- **Marcadores sin rellenar** — `[Universidad]`, `[Nombre del profesor]`, `Lorem
  ipsum`. Rellenalos si sabes el dato; si no, dejalos visibles y dilo explicitamente.
- **Inconsistencias entre partes** — el mismo dato escrito distinto en portada y
  cuerpo. Es lo mas frecuente y lo que mas penaliza un evaluador.
- **Referencias cruzadas rotas** — "ver figura 6" cuando esa figura es la 11.
- **Contenido truncado** — codigo o tablas cortadas con "(truncado)" o "...".
- **Orden ilogico** — conclusiones en medio, anexos antes del cierre.
- **Tablas que piden ser tablas** — enumeraciones largas en prosa, y al reves.
- **Secciones que faltan** — si describe un procedimiento con parametros pero nunca
  los tabula, añade esa tabla.

Presenta los hallazgos **separados en dos grupos**: los que corregiste tu y los que
requieren decision del usuario. Nunca cambies en silencio un dato que describe lo que
el usuario hizo — señala, no reescribas.

## Ajustes frecuentes

**Tamaño distinto de A4:** pasa `margins` a `build()` y llama a `contentWidth()` con
el nuevo ancho util; ajusta los anchos de tabla en consecuencia.

**Sin portada:** llama a `build()` con `cover: []`. El documento arranca directo con
encabezado y pie.

**Fuentes distintas:** `theme({ HFONT: 'Georgia', BFONT: 'Segoe UI' })`. Usa fuentes
que existan en Word sin instalacion: Cambria, Calibri, Georgia, Constantia, Segoe UI
y Consolas son apuestas seguras.

**Insertar imagenes de verdad** (no marcos vacios): usa `ImageRun` de docx-js dentro
de un `Paragraph`, con `type` explicito (`"png"`, `"jpg"`). Los marcos de `figure()`
existen para cuando el usuario aun no tiene las capturas.

## Errores conocidos de docx-js

- `ShadingType.SOLID` renderiza negro; usa siempre `ShadingType.CLEAR`.
- Las tablas necesitan ancho doble: `columnWidths` en la tabla **y** `width` en cada
  celda, ambos en `WidthType.DXA`. `PERCENTAGE` se rompe en Google Docs.
- `PageBreak` tiene que ir dentro de un `Paragraph`.
- Nunca metas `\n` en un `TextRun`; usa parrafos separados.
- El paquete `docx` vive en el harness global. No corras `npm install` salvo que
  `require('docx')` falle desde tu carpeta de trabajo.
