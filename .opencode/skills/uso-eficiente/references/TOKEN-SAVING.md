# Ahorro de contexto

Carga esta referencia cuando la investigacion sea amplia o el contexto sea costoso.

## Lectura

- Busca nombres, simbolos y patrones antes de leer; usa rangos minimos alrededor de coincidencias.
- Lee en paralelo archivos independientes, evita repetir lecturas vigentes y no recorras directorios ignorados.
- En PowerShell no uses `Get-ChildItem -Recurse` sobre `.opencode/` (contiene node_modules); apunta al subdirectorio objetivo.

## Edicion

- Prefiere parches pequenos y revisa solo el fragmento afectado tras editar.
- Edita mediante cambios dirigidos; no reescribas archivos completos para modificaciones locales.
- Verifica con la comprobacion mas especifica que demuestre que el cambio funciona.

## Delegacion

- Delega exploracion amplia con una pregunta concreta y pide rutas, evidencia y conclusiones.
- No ejecutes secuencialmente lo que un subagente puede hacer aislado.

## Conservacion de contexto

- Conserva en el contexto principal solo decisiones, hallazgos, riesgos y validaciones relevantes; resumen en lugar de copiar.
- Carga skills bajo demanda y conserva resultados para no reconstruirlos.
- El ahorro nunca justifica omitir evidencia necesaria ni requisitos de la DoD.

## Skills

- Carga solo las obligatorias al inicio; las opcionales cuando la tarea las activa.
- No cargues skills de respaldo "por si acaso"; cada skill es contexto pagado en tokens.

## Specs

Estas reglas de consumo viven solo aqui (fuente unica por regla); los topes definidos en el plan tecnico (`PLAN-TECNICO.md`) no se repiten en este documento.

- Lee la spec parcial: cabecera + seccion necesaria con `offset`/`limit`; nunca la spec completa dos veces en la misma sesion.
- Specs `obsoleta` no se cargan salvo trazabilidad explicita.
- No pegues logs, diffs ni salidas largas dentro de la spec: evidencia por referencia.
- Al implementar, consulta la spec solo hasta cerrar la feature; despues vive en el cerebro (`contexto-proyecto`) y la spec como historia.
- Cada linea de spec es contexto pagado en todas las sesiones futuras: divide la feature antes de inflar la spec.
