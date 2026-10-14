---
name: evaluacion-experiencia
description: Medicion cuantitativa de UX y calidad percibida: SUS, UMUX-Lite, NASA-TLX, factores de calidad ISO 25010/SQuaRE, sesiones con usuarios e informes con confidence. Usar al medir, validar MVP o cerrar releases con UI; no para review heuristica ni criterios de diseno.
---

# Evaluacion de experiencia

Canon unico del harness para medir UX y calidad percibida. Cierra el ciclo de ui-ux/impeccable (cualitativo) con numeros defendibles y un gate en calidad-cierre. Orden estricto: nunca mezclar percepcion con ejecucion.

## Flujo (6 etapas, confirmacion explicita entre cada una; nunca Q&A aleatoria)
1. Encuadre: decision (comparar diseños, validar MVP, detectar deuda), recursos (n, tiempo) y umbrales de bloqueo (ej. SUS >= 68). Sin objetivo decisional no hay cuestionario.
2. Seleccion de instrumento: 1-2 candidatos de INSTRUMENTOS.md, encaje con pregunta y n. Aprobacion tuya.
3. Diseno de sesion: tareas con exito observable; guion libre de sesgos (PROTOCOLO-SESION.md); validarlo linea a linea la primera vez.
4. Administracion: tu dictas/pegas respuestas. Prohibido inventar o extrapolar; marcar autoinforme vs observacion.
5. Analisis: formulas exactas (ANALISIS-ESTADISTICO.md); contextualizar n (n<8 = solo indicativo); cada puntaje bajo -> hallazgo con evidencia file:línea o descripcion de interaccion.
6. Informe y gate: PLANTILLA-INFORME.md + radar ISO-25010.md; persistir en docs/project-brain/ux-evaluacion/ con confidence: medido|estimado; umbrales alimentan calidad-cierre (SUS < 68 -> BLOQUEADO hasta plan de correccion).

## Reglas de delegacion (anti-duplicacion)
| Skill | Relacion |
| ui-ux | ella define criterios cualitativos; esta skill los mide numericamente |
| accesibilidad | canon WCAG sigue alli; items de percepcion accesibilidad, sin re-auditar |
| impeccable / impeccable-doctrina | crean la UI; esta skill mide sobre UI estable (post-impeccable) |
| frontend-design-review | si se resuelve con inspeccion heuristica barata, redirige alli; aqui hace falta numero defendible o evidencia de usuarios |
| criterio-proyecto | ella define alcance; esta skill provee las metricas de exito de PRODUCT.md |
| calidad-cierre | consume los umbrales de esta skill como criterio de gate |
| performance | el rendimiento objetivo es de ella; aquí solo percepcion |

## Limites (textual)
- SQuaRE/ISO 25010 se usa como vocabulario de mapeo, no como certificacion: prohibido afirmar "cumple ISO 25010" sin evaluacion formal completa.
- Instrumentos con copyright (QUIS, UEQ): items parafraseados citando fuente. SUS, UMUX-Lite y NASA-TLX son libres con atribucion.
- Sin usuarios reales: solo estimacion heuristica etiquetada confidence: estimado, nunca presentada como dato medido.

Cargar bajo demanda: INSTRUMENTOS.md, ISO-25010.md, PROTOCOLO-SESION.md, ANALISIS-ESTADISTICO.md, PLANTILLA-INFORME.md.