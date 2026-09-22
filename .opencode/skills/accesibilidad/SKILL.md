---
name: accesibilidad
description: Accesibilidad WCAG 2.2 AA profunda (checklist base canonico): semantica HTML, navegacion por teclado, lectores de pantalla, formularios, foco y testing con lectores/axe. Usar al construir componentes complejos (modales, tabs, menus), formularios, contenido dinamico o al auditar accesibilidad. Las demas skills remiten aqui.
---

# Accesibilidad

## WCAG 2.2 AA como piso

- Cuatro principios: perceptible, operable, comprensible, robusto. AA es requisito, AAA donde sea posible sin romper diseño.

## Checklist base (fuente canonica)

- Contraste >=4.5:1 en texto y >=3:1 en UI/graficos; nunca solo color para transmitir estado.
- Foco visible y no oculto (sticky/footers); orden de foco igual al orden visual.
- Todo operable con teclado, sin trampas de foco; atajos con alternativa.
- Nombre accesible en cada control; labels reales; errores anunciados (`aria-describedby`).
- Objetivos tactiles >=24x24 px CSS (44x44 recomendado en tactil).
- Drag, autoplay y animacion: alternativa, pausa o respeto a `prefers-reduced-motion`.
- Auth accesible (sin tests cognitivos ocultos; permitir pegar/gestionar contrasena) — nuevo en 2.2.
- Ayuda consistente y sin reingreso de datos ya aportados — nuevo en 2.2.

## Semantica primero, ARIA despues

- HTML semantico nativo resuelve el 80%: `button` para botones, `a` para navegacion, `nav/main/header/footer` como landmarks, headings jerarquicos sin saltarse niveles.
- "No ARIA is better than bad ARIA": `aria-label` solo cuando no hay texto visible; nunca para "arreglar" un elemento semantico incorrecto.
- Listas como listas, tablas como tablas (con `th` y scope); el diseño con divs no anula la semantica.

## Teclado

- Todo interactivo alcanzable y operable con teclado; orden de foco sigue el orden visual.
- Focus visible siempre: `outline: none` solo con reemplazo equivalente; nada de eliminarlo globalmente.
- Modales: focus trap dentro, `Esc` cierra y el foco vuelve al trigger al cerrar (regla ya en `ui-ux`; aca se implementa).
- Skip link al contenido principal en paginas con navegacion larga.

## Lectores de pantalla y contenido dinamico

- `alt` descriptivo en imagenes con significado; `alt=""` en decorativas; iconos con texto accesible.
- Contenido que aparece/cambia solo se anuncia con `aria-live` (errores de formulario, resultados de busqueda, toasts).
- Estados en atributos, no solo en estilo: `aria-expanded`, `aria-selected`, `aria-current`; el lector necesita saber el estado, no adivinar por color.

## Formularios

- `<label>` real asociado a cada campo; el placeholder nunca es label.
- Errores: mensaje especifico junto al campo, anunciado, con `aria-describedby`; el foco va al primer error al enviar.
- Agrupa campos relacionados con `fieldset`/`legend`.

## Testing de accesibilidad

- Pasar la pagina usando SOLO teclado antes de mirar el mouse.
- Un lector de pantalla real (NVDA/VoiceOver) en los flujos criticos, no solo en el componente aislado.
- `axe` o Lighthouse en CI para lo automatico; lo que axe no ve (orden de foco, sentido del alt, jerarquia) se revisa manual (agente `tester`).
- `prefers-reduced-motion` respetado en toda animacion (regla de `ui-ux`).
