# Temas personalizados de OpenCode

Documentación de los temas definidos en este directorio.

---

## darman-prog

### Nota de autor
- se puede modificar el nombre sin problema o cambiar el diseño inicial para crear nuevos temas.
### Fin de nota de autor


**Archivo:** `darmandev.json`
**Inspiración:** Tokyo Night Storm
**Creado:** 2026-09-29
**Activación:** `~/.config/opencode/tui.json` → `"theme": "darmandev"`

### Objetivo

Mi objectivo principal fue reducir fatiga visual en sesiones largas de 4+ horas. Fondo azul oscuro
(`#1a1b26`) en lugar de negro puro, y contraste suave en los tonos de texto
para no forzar la vista con brillos altos sobre fondo oscuro.

### Paleta

| Rol | Def | Hex | Uso |
|---|---|---|---|
| Background | `bg` | `#1a1b26` | Lienzo, salida de consola, contexto de diff |
| Background Alt | `bg-alt` | `#1f2335` | Paneles, elementos, menús |
| Foreground | `fg` | `#e8e8e8` | Texto principal |
| Foreground Muted | `fg-muted` | `#7a7a8c` | Texto secundario, comentarios |
| Accent Primary | `accent` | `#7aa2f7` | Prompts, interacciones, headings |
| Accent Secondary | `accent-secondary` | `#bb9af7` | Tipos, variables, numeración de listas |
| Success | `success` | `#9ece6a` | Diffs añadidos, tests OK |
| Error | `error` | `#f7768e` | Errores en la UI |
| Error Bright | `error-bright` | `#ff8ba3` | Texto de diffs eliminados |
| Warning | `warning` | `#e0af68` | Advertencias, énfasis italic |
| Info | `info` | `#7dcfff` | Información neutral, enlaces |
| Highlight | `highlight` | `#e0af68` | Negrita (`markdownStrong`), números |
| Border | `border` | `#414868` | Bordes de paneles |
| Border Subtle | `border-subtle` | `#3b4261` | Separadores táctiles, línea horizontal |
| Diff BG Add | `diff-bg-add` | `#42513a` | Fondo de líneas añadidas |
| Diff BG Del | `diff-bg-del` | `#5c3645` | Fondo de líneas eliminadas |
| Diff Line Number | `diff-lineno` | `#c0c6d6` | Números de línea en diffs |

### Mapa semántico

| Elemento de UI | Clave | Color |
|---|---|---|
| Errores en la UI | `error` | `#f7768e` |
| Confirmaciones / éxito | `success` | `#9ece6a` |
| Advertencias | `warning` | `#e0af68` |
| Información | `info` | `#7dcfff` |
| Enlaces | `info` | `#7dcfff` |
| Prompts e inputs | `primary` | `#7aa2f7` |
| Texto de diff eliminado | `error-bright` | `#ff8ba3` |
| Negrita en markdown | `highlight` | `#e0af68` |
| Cursiva en markdown | `warning` | `#e0af68` |

### Sintaxis (remix fiel a Tokyo Night)

Los colores semánticos se reparten así para maximizar información por color:

| Token | Color | Hex | Ratio |
|---|---|---|---|
| Keyword | violeta | `#bb9af7` | 6.72 |
| Tipo | violeta | `#bb9af7` | 6.72 |
| Función | azul | `#7aa2f7` | 6.18 |
| Operador | cyan | `#7dcfff` | 9.07 |
| Variable | neutro | `#e8e8e8` | 12.69 |
| String | verde | `#9ece6a` | 8.51 |
| Número | ámbar | `#e0af68` | 7.78 |
| Comentario | gris-muted | `#7a7a8c` | 3.70 |

Criterio: los tokens abundantes (variables, puntuación) van en neutro para
que el color señale estructura, no relleno.

### Jerarquía de fondos

No existe una clave específica para la salida de consola: el texto de las
herramientas se pinta sobre el lienzo. Las cuatro claves de fondo son:

| Clave | Def | Hex | Superficie |
|---|---|---|---|
| `background` | `bg` | `#1a1b26` | Lienzo: conversación y salida de consola |
| `backgroundPanel` | `bg-alt` | `#1f2335` | Paneles laterales |
| `backgroundElement` | `bg-alt` | `#1f2335` | Mensajes de usuario, caja de input |
| `backgroundMenu` | `bg-alt` | `#1f2335` | Menús y diálogos |
| `diffContextBg` | `bg` | `#1a1b26` | Líneas de contexto de diff |
| `diffAddedBg` / `diffAddedLineNumberBg` | `diff-bg-add` | `#42513a` | Líneas añadidas (tinte verde) |
| `diffRemovedBg` / `diffRemovedLineNumberBg` | `diff-bg-del` | `#5c3645` | Líneas eliminadas (tinte rojo) |

Tres niveles: lienzo oscuro, superficies elevadas, líneas de diff teñidas.

### Diffs teñidos

Las adiciones y eliminaciones se pintan con fondo tintado y texto brillante,
no con texto de color sobre fondo neutro. El tinte se calcula como
`tint(bg, color, alpha)` sobre `#1a1b26`:

- Adiciones: `bg` + 30% de `success` → `#42513a`
- Eliminaciones: `bg` + 30% de `error` → `#5c3645`

| Clave | Hex | Ratio sobre su fondo | Estado |
|---|---|---|---|
| `diffAdded` | `#9ece6a` | 4.65 sobre `#42513a` | AA |
| `diffRemoved` | `#ff8ba3` | 4.58 sobre `#5c3645` | AA |
| `diffLineNumber` | `#c0c6d6` | 4.98 (mín. de los 3 fondos) | AA |

### Dial del tinte

`alpha` controla cuánto se ve el tinte. El techo está en el contraste del
texto sobre su propio fondo, no en el del tinte:

| alpha | Fondo add | Tinte vs lienzo | `diffAdded` | Estado |
|---|---|---|---|---|
| 0.22 | `#374235` | 1.62 | 5.77 | AA |
| 0.26 | `#3c4a38` | 1.81 | 5.16 | AA |
| **0.30 (actual)** | `#42513a` | **2.01** | **4.65** | AA |
| 0.32 | `#44543c` | 2.10 | 4.46 | bajo AA |
| 0.35 | `#485a3e` | 2.29 | 4.09 | bajo AA |

Pasado `0.30` hay que aclarar también el verde de adiciones, no solo el rojo.
Si se sube el tinte, reajustar `diffAdded` y `diffRemoved` en la misma pasada.

`diffRemoved` usa `error-bright` (`#ff8ba3`) en vez de `error` (`#f7768e`):
con el rojo original cae bajo 4.5 sobre el tinte rojo. El rojo de la UI
(`error`) no cambia — solo el texto dentro de diffs.

`diffLineNumber` tiene color propio porque al tintarse los fondos el
`border` (#3b4261) quedaba a 1.07 de contraste y los números de línea se
volvían ilegibles.

Para ver el diff en dos columnas en vez de una, `tui.json` → `"diff_style": "stacked"`.

### Claves no documentadas que sí funcionan

`themes/` no las menciona, pero el tipo `ThemeColors` en
`packages/opencode/src/cli/cmd/tui/context/theme.tsx` las soporta:

- `backgroundMenu` — si se omite, cae a `backgroundElement`. Se declara
  explícito para que cambiar paneles no arrastre los menús.
- `selectedListItemText` — si se omite, cae a `background`. **No definirla**:
  esa inversión (texto oscuro sobre fondo accent claro) es la correcta, y
  fijarla a mano rompe el contraste de las listas de selección.
- `thinkingOpacity` — **número plano, default `0.6`, rango 0–1.** Solo cambia el
  canal alfa del resaltado `subtle` con el que se renderiza el razonamiento;
  preserva el RGB. Aquí está en `0.5`. Se escribe en `theme` como número, no
  como `{"dark": ..., "light": ...}` ni en `defs`.

  | Valor | Ratio del texto | Estado |
  |---|---|---|
  | `0.8` | 9.31 | AA, apenas se nota |
  | `0.6` (default) | 5.80 | AA, tenue pero legible |
  | **`0.5` (actual)** | **4.46** | justo bajo el mínimo AA |
  | `0.4` | 3.32 | solo texto grande |
  | `0.3` | 2.45 | ilegible |

  Rango útil `0.4`–`0.7`. No bajar de `0.4`: los comentarios del razonamiento
  usan `fg-muted`, que a `0.4` cae a 1.70:1.

  Para ocultar los bloques del todo en vez de atenuarlos, usar `/thinking`.

### Contraste (WCAG 2.1, ratio vs `bg` #1a1b26)

| Clave | Ratio | Estado |
|---|---|---|
| `fg` | 13.95 | AAA |
| `info` | 9.96 | AAA |
| `success` | 9.35 | AAA |
| `warning` / `highlight` | 8.55 | AAA |
| `accent-secondary` | 7.39 | AA |
| `accent` | 6.79 | AA |
| `error` | 6.46 | AA |
| `fg-muted` | 4.06 | bajo AA (comentarios) |
| `border` | 1.74 | decorativo, sin requisito |

### Nota sobre `accent` — no oscurecer

`accent` alimenta `syntaxKeyword`, `syntaxFunction`, `syntaxOperator`,
`markdownHeading`, `markdownListItem`, `borderActive` y `primary`: es texto
código, no adorno. Su ratio mínimo es **4.5:1** (AA texto normal).

Se evaluó oscurecerlo para reducir competencia visual con el texto:

| Valor | Ratio | Estado |
|---|---|---|
| `#7aa2f7` (actual) | 5.78 | AA |
| `#6f9ae8` | 5.18 | AA — límite razonable |
| `#6890c8` | 4.45 | bajo AA |
| `#5d7cb8` | 3.50 | solo texto grande |

La "niebla" se resolvió subiendo `fg` a blanco puro (9.02 → 11.89), no
bajando `accent`. Si en el futuro hay que separar más el accent, el techo
aceptable es `#6f9ae8`; por debajo degrada la lectura de keywords.

### Notas de mantenimiento

- Si un color cansa la vista tras varias horas, ajusta la luminosidad ±10% en
  `defs` y recarga con `/themes`.
- Si un elemento no se distingue, revisa el contraste contra `bg` antes de
  cambiar de tono.
- Si agregas un color a `defs`, úsalo en `theme` o quedará huérfano.
- Las claves del bloque `theme` son **camelCase** (`textMuted`,
  `backgroundPanel`). Las de `defs` pueden ser kebab-case (`bg-alt`).

### Límite conocido

OpenCode colorea los elementos de su propia UI, **no la salida de comandos**.
El output de bash, tests o cualquier comando se renderiza con el tema del
terminal anfitrión, no con este tema.

---

## Notas sobre el formato

- La extensión debe ser `.json`. El loader de temas usa el glob `*.json`; no
  reconoce `.jsonc` aunque el formato lo soportaría.
- `tui.json` y `tui.jsonc`, en cambio, sí aceptan ambas extensiones.
- El nombre del tema en `tui.json` es el nombre del archivo sin extensión.



### atentamente Diego Meza alias darman-prog