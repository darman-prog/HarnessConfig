---
name: code-clue
description: Comentarios naturales al escribir o modificar código en cualquier proyecto: qué hace y por qué, con densidad según la complejidad. De cero en código obvio a uno por idea no obvia (regex, algoritmos, efectos secundarios). Cárgala siempre que la tarea cambie código.
---

# Comentarios que orientan

Un comentario es una frase breve que explica qué hace un bloque de código y por qué se hace así. Objetivo: un dev junior entiende la intención sin leer la implementación línea a línea.

## Paso 1 — Clasifica cada bloque

Recorre el código bloque por bloque. Quédate con la **primera** fila que sea cierta:

| Orden | Señal | Nivel |
| --- | --- | --- |
| 1 | Hace algo fuera de sí mismo: escribe en disco o BD, llama a una API externa, envía correo, cobra, borra, muta estado compartido | **Alto** |
| 2 | Depende de una regla, convención, estándar o número mágico que no se deduce leyendo el código | **Alto** |
| 3 | Construcción difícil de leer de un vistazo: regex, algoritmo no trivial, cadena de condiciones, máquina de estados, concurrencia, cálculo numérico | **Alto** |
| 4 | Traduce o transforma datos entre formatos, capas o tipos | **Medio** |
| 5 | Rechaza entradas inválidas: validación, guarda, early return, sanitizado | **Medio** |
| 6 | Captura y maneja errores de forma no trivial (distinto de capturar y relanzar tal cual) | **Medio** |
| 7 | Nada de lo anterior: el nombre y los argumentos ya explican qué pasa | **Bajo** |

## Paso 2 — Escribe según el nivel

| Nivel | Dónde | Cuántos | Tamaño |
| --- | --- | --- | --- |
| Bajo | — | Ninguno | — |
| Medio | Antes del bloque | 1 | Una frase: qué decide o protege y por qué importa |
| Alto | Antes de cada idea no obvia | 1 por idea, 2 máximo por bloque | Hasta 2 líneas: el qué y el porqué |

Si dudas entre dos niveles, **baja uno**. Si aún dudas, aplica la pregunta: **¿un dev junior podría predecir el efecto de esa línea leyendo solo su nombre?** Si no → comenta.

## Paso 3 — Redacta

- Tono de profesor explicativo: frases cortas, palabras comunes, en el idioma del proyecto. Sin etiquetas ni prefijos: nada de `[CLUE]` ni `// NOTA:`.
- El comentario va **antes** del bloque que explica, con su sangría.
- El docstring o la firma **no** sustituyen el comentario inline en nivel medio o alto: el docstring describe la función, el comentario explica la decisión.
- Si el bloque supera las 3 ideas no obvias, divídelo en vez de escribir un comentario largo.

## Errores que debes evitar

- Comentar línea por línea o repetir lo que el nombre ya dice.
- Describir la sintaxis ("esto es un bucle for", "asignamos el valor").
- Escribir un párrafo donde bastaba una frase.
- Tocar código generado, vendor o comentarios ajenos fuera del cambio.
- Dejar un comentario que ya no describe lo que hace el código.

Un comentario corto cuesta menos que pedir la explicación después.
