---
name: code-clue
description: DEBE añadir comentarios inline naturales al escribir o modificar código en cualquier proyecto. Obligatorio en toda tarea que cambie código.
---

# Comentarios obligatorios al cambiar código

Cada bloque no obvio que escribas lleva un comentario antes.

## Bloques que siempre necesitan comentario
- Regex: explica qué valida el patrón.
- Chequeos de tipo o edge cases (`isinstance`, `isNaN`, early returns defensivos).
- Números mágicos o condiciones de más de dos partes: explica qué significa.
- split / index / slicing con lógica no trivial.
- Manejo de errores que no sea relanzar la excepción tal cual.

## Formato
- Una frase corta, antes del bloque, en el idioma del proyecto.
- Tono natural (estilo profesor), sin etiquetas ni prefijos.

## Bloques que no necesitan comentario
- Asignaciones cuyo nombre ya lo explica (`user_count = len(users)`).
- Getters/setters triviales.
- Nombres autoexplicativos.
