# Criterios UI/UX

## Revisión

- **Jerarquía:** título, acción primaria, contenido y navegación se entienden en una pasada; el foco visual coincide con la tarea.
- **Accesibilidad:** semántica, teclado, foco, contraste, nombre accesible y mensajes cumplen WCAG 2.2 AA cuando aplique. Para profundidad, carga `accesibilidad`.
- **Responsive:** identifica cambios de espacio, entrada, orientación y densidad; evita breakpoints basados solo en nombres de dispositivos.
- **Estados:** contempla inicial, carga, vacío, error recuperable, éxito, deshabilitado, permisos y datos largos.
- **Tokens:** reutiliza color, tipografía, espaciado, elevación, foco y tema existentes; no uses valores aislados sin razón.
- **Feedback:** confirma acciones, progreso y errores cerca de su causa; respeta `prefers-reduced-motion`.

## Elecciones de contenedor

Usa inline para decisiones pequeñas y contextuales; modal para una interrupción breve y reversible; drawer para tareas secundarias con contexto; página para tareas largas, enlazables o con navegación propia. Elige según complejidad, móvil, teclado y posibilidad de recuperar el contexto.

## Formularios y anti-patterns

Asocia labels, valida en el momento adecuado, conserva entradas y explica cómo corregir errores. Evita placeholder como label, acciones sin estado, modales anidados, hover como única información, scroll horizontal accidental y skeletons que no reflejan la estructura real.

Remite a `convenciones-frontend` y `accesibilidad` en vez de duplicar sus checklists.
