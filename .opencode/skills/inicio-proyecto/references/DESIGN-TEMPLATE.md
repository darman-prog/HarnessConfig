# Template DESIGN.md

Usa esta estructura para generar el `DESIGN.md` del proyecto, reemplazando los placeholders con las respuestas del usuario.

```markdown
# Diseno — {Nombre del proyecto}

## Direccion visual

{Estilo general: minimalista, colorido, corporativo, gaming, etc. 2-3 frases sobre el "look and feel" deseado.}

## Voz y personalidad

{Como "suena" la interfaz: profesional, amigable, tecnico, divertido, etc.}

## Paleta de colores

| Proposito | Color | Hex |
| --- | --- | --- |
| Primario | {...} | #...... |
| Secundario | {...} | #...... |
| Acento | {...} | #...... |
| Fondo | {...} | #...... |
| Texto | {...} | #...... |
| Error | {...} | #...... |
| Exito | {...} | #...... |
| Advertencia | {...} | #...... |

## Tipografia

- **Principal**: {familia, pesos usados}
- **Mono/codigo**: {familia para bloques de codigo}

## Tokens de diseno

{Espaciado base (8px/4px), border-radius, elevacion, breakpoints si se conocen}

## Componentes clave

- {Componente 1: proposito y comportamiento}
- {Componente 2: proposito y comportamiento}

## Layout y estructura

{Estructura general: sidebar + contenido, single-page, dashboard grid, etc.}

## Estados a cubrir

- Inicial / sin ejecutar
- Carga (skeleton/spinner)
- Exito (confirmacion proporcional)
- Vacio (explicacion + siguiente accion)
- Error recuperable / definitivo
- Datos parciales o deshabilitado
- Reintento cuando sea viable

## Accesibilidad (piso WCAG 2.1 AA)

- Semantica nativa antes que ARIA.
- Operacion completa por teclado sin trampas de foco.
- Foco visible y logico.
- Contraste suficiente para texto, controles, estados y foco.
- Informacion no dependiente solo de color.
- Objetivos tactiles y separacion adecuada.
- `prefers-reduced-motion` respetado.

## Motion / animaciones

{Tipo de microinteracciones: hover, focus, entrada/salida, feedback. Respetar reduced motion.}

## Restricciones visuales

{Lo que NO se debe hacer: sin modales anidados, sin scroll horizontal, etc.}
```

## Notes

- Si el usuario no conoce hex de colores, usa nombres descriptivos y marca hex como "por definir".
- Si no tiene tipografia elegida, recomienda una del stack (ej. Inter/Roboto para React, Nuxt font para Vue).
- No inventes tokens que no haya mencionado el usuario.
