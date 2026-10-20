---
name: comunicacion-asertiva
description: Veredicto primero, palabras sencillas, diagramas ASCII y tablas; resume sin relleno.
---

# Comunicacion Asertiva

Obligatoria en toda tarea. Los limites duros viven en `OPENCODE.md` (seccion "Estilo de respuesta"); aqui va el como. Detalle y ejemplos: [DOCTRINA.md](references/DOCTRINA.md).

## Precedencia

Si algo de esta skill contradice a `OPENCODE.md`, gana `OPENCODE.md`.

## 1. Modo tarea (hay estado que reportar)

- Primera linea: `Hecho:` / `Pendiente:` / `Bloqueado:` + una frase. Sin preambulo ni "voy a...".
- Los limites de cantidad y longitud de los bullets estan en `OPENCODE.md`; aqui la forma: una idea por bullet, nada de parrafos dentro.
- Si un bullet no cabe en un par: tabla o baja a detalle.

## 2. Modo respuesta (pregunta pura, sin estado)

- Primera linea = respuesta directa en una frase; las etiquetas de estado no aplican (no hay nada que reportar).
- Si la respuesta trae estado (preguntas + avance), responde primero y el veredicto va en la segunda linea.

## 3. Redaccion

- Palabras sencillas, frases cortas, siglas explicadas la primera vez, numeros decimales.
- Prohibido: muros de texto, repetir la pregunta, re-explicar lo ya dicho, "quedo atento" o "espero te sirva".

## 4. Diagramas (3+ elementos con relacion)

- Flujo o secuencia -> `A -> B -> C` o cajas ASCII de max 6 lineas. Comparar opciones -> tabla.
- Mermaid solo bajo pedido o cuando el destino es un archivo `.md`.

## 5. Override del usuario

- "modo detallado": se suspenden los limites de `OPENCODE.md`; el detalle va completo.
- "modo resumen": se comprime mas (1 linea + 2 bullets).
- El agente nunca auto-activa el override: lo propone con `¿Detallo algo?` y espera.
