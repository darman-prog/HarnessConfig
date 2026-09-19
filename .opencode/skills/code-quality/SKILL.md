---
name: code-quality
description: Calidad de codigo: principios DRY/KISS/YAGNI, SOLID aplicado, complejidad, nombres y code smells. Usar al escribir o revisar codigo nuevo, al evaluar deuda tecnica o al preparar revision con auditor. No cubre el proceso de refactor: para eso esta refactoring.
---

# Code Quality

## Principios con criterio

- DRY: extrae duplicacion de **conocimiento**, no de coincidencia; dos bloques iguales que evolucionan distinto no se unen.
- KISS: la solucion simple que funciona le gana a la elegante que no se entiende.
- YAGNI: nada "por si acaso"; la abstraccion entra con el segundo caso real, no el primero imaginado.
- SOLID aplicado por capa: ver skill `arquitectura`; aca se aplica a diario al ubicar logica.

## Smells que bloquean

- Funcion que hace y explica: nombre con "and"/"or", mas de un nivel de abstraccion mezclado.
- Complejidad ciclomatica practica: >10 en una funcion se divide; no se relaja el umbral del linter sin justificar en el cambio.
- Nombres mentirosos: variable llamada `list` que es mapa, metodo `get` que muta.
- Comentario que explica que hace el codigo: renombra o extrae; el comentario solo explica el por que no evidente.
- Parametros booleanos que bifurcan la funcion en dos no-verificadas: dos funciones.
- Feature envy y god object: logica que pertenece a otro modulo o clase de 1000 lineas.

## Convenciones de escritura

- Funciones pequeñas, un nivel de indentacion de complejidad por bloque donde el lenguaje lo permita.
- Errores explicitos: no silencies con catch vacio ni `as any`/cast forzado sin validacion previa.
- Codigo muerto se elimina en el mismo PR que lo reemplaza; el historial de git recuerda.

## Revision

- El agente `auditor` es el revisor formal en pre-merge; esta skill es la vara con la que escribes antes de que te revise.
- Deuda detectada y no abordada se reporta con severidad, nunca se deja sin registrar.
