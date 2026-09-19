# Guía de decisión de producto

Sirve para ordenar decisiones de alcance y prioridad. Léela cuando existan varias alternativas, presión por ampliar un MVP o incertidumbre sobre el valor.

## Secuencia

1. **Objetivo:** describe el resultado observable y quién se beneficia.
2. **Evidencia:** clasifica cada afirmación como observada, confirmada, inferida o pendiente. No presentes supuestos como hechos.
3. **Mínimo completo:** define el flujo de inicio a fin que entrega valor, incluidos errores, permisos y estados esenciales.
4. **No-objetivos:** registra funcionalidades, plataformas y optimizaciones explícitamente fuera del alcance.
5. **Alternativas:** compara al menos la opción simple, la opción existente reutilizable y una alternativa si el riesgo lo justifica.
6. **Reversibilidad:** decide con más cautela si cambiar después implica migración, pérdida de datos, contrato público o dependencia externa.
7. **Confirmación:** pregunta si falta una decisión de negocio, el alcance puede crecer o la opción elegida es difícil de revertir.

## Señales de sobre-ingeniería

- Abstracción sin segundo caso real.
- Soporte para escala, proveedores o configuraciones no requeridas.
- Trabajo de pulido que no cambia el criterio de éxito.
- Complejidad operativa mayor que el riesgo que mitiga.

## Comparación breve

| Criterio | Pregunta |
| --- | --- |
| Valor | ¿Qué resultado mejora y cómo se sabrá? |
| Coste | ¿Qué esfuerzo, mantenimiento y dependencia introduce? |
| Riesgo | ¿Qué puede fallar y cuál es el impacto? |
| Reversibilidad | ¿Puede retirarse sin migración o ruptura? |
| Evidencia | ¿Qué observación respalda la elección? |

El cierre debe dejar decisión, evidencia, supuestos pendientes y una acción concreta.
