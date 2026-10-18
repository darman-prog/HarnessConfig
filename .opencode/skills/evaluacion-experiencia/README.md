# evaluacion-experiencia: contexto para agentes

## Por que existe
Llena el hueco de medicion cuantitativa: el harness tenia evaluacion cualitativa (ui-ux, frontend-design-review, impeccable), no escalas ni vocabulario de factores de calidad.

## Estructura
SKILL.md (flujo y gate) + 5 referencias: INSTRUMENTOS, ISO-25010, PROTOCOLO-SESION, ANALISIS-ESTADISTICO, PLANTILLA-INFORME.

## Flujo
6 etapas con confirmacion entre ellas: encuadre, instrumento, sesion, administracion, analisis, informe y gate.

## Activacion
Skill Gate de OPENCODE.md, invocacion explicita por nombre o instrumento, y post-condicion tras calidad-cierre en releases con UI o en metricas de exito de inicio-proyecto.

## Relaciones (anti-duplicacion)
ui-ux criterios cualitativos; accesibilidad canon WCAG; impeccable/impeccable-doctrina UI estable; frontend-design-review heuristica barata redirige; criterio-proyecto alcance; calidad-cierre gate; performance percepcion no objetivo.

## Decisiones de diseño
- SQuaRE como vocabulario, no articulado copiado ni certificacion (vocabulario adaptado).
- Sin subagente dedicado aún: build y agentes existentes orquestan.

## Deuda técnica
- Gate de adopcion time-boxed: revisar tras primera medicion real o 30 dias; 0 usos implica retirar vía sync.
- Subagente ux-research opcional cuando la demanda lo justifique.
- Calibrar benchmarks con la primera medicion real.
- Correr sync-global si se aplico en otra maquina.
```