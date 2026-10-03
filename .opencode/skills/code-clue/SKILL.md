---
name: code-clue
description: Añade comentarios breves y naturales, como una explicación de profesor, al escribir o modificar código en cualquier proyecto. Cárgala siempre que la tarea cambie código.
---

# Comentarios que orientan

Ayuda a entender la intención del código nuevo o modificado sin convertirlo en un tutorial ni repetir lo que ya dicen los nombres.

- Escribe comentarios en lenguaje cotidiano y con el idioma y tono del proyecto; sin etiquetas, prefijos ni formato especial.
- Explica una idea por comentario: qué resuelve esa parte y, cuando no sea evidente, por qué se hace así o qué condición importante conserva.
- Pon el comentario junto al bloque que explica. Prefiere una frase corta; usa dos solo si hacen falta para entender una decisión o un flujo.
- Comenta bloques lógicos, validaciones, transformaciones, efectos secundarios y decisiones no obvias; no cada línea.
- No narres sintaxis obvia, nombres autoexplicativos, getters triviales ni lo que ya explica una firma o documentación cercana.
- Escribe el comentario al crear o cambiar el código y mantenlo cierto si luego cambia la implementación.
- No añadas comentarios a código generado o vendor, ni reescribas comentarios ajenos fuera del cambio.

```js
// Comprobamos la firma antes de aceptar el evento para no procesar avisos falsificados.
if (!verifySignature(request)) return unauthorized();
```
