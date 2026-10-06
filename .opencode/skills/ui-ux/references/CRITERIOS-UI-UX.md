# Criterios UI/UX

Este archivo es el índice de lo que **no** tiene canon en otra skill. Cada criterio vive en un único sitio:

- **Jerarquía:** el foco visual debe coincidir con la tarea. El resto del análisis → `frontend-design-review` (pilares) e `impeccable`.
- **Accesibilidad:** checklist completo en `accesibilidad` (WCAG 2.2 AA es el canon). No lo dupliques aquí.
- **Responsive:** define por capacidades y tamaños, no por nombres de dispositivos → `impeccable` (guía adapt).
- **Estados:** carga, vacío, error, éxito, deshabilitado → `convenciones-frontend` e `impeccable` (guía harden).
- **Tokens:** reutiliza color, tipografía, espaciado y foco existentes → `convenciones-frontend` y `frontend-design-review`.
- **Feedback:** los errores se señalan cerca de su causa y se respeta `prefers-reduced-motion` → `accesibilidad` e `impeccable` (guía animate).

## Lo único que no está en otra skill

- **Elección de contenedor:** inline para decisiones pequeñas y contextuales; modal para una interrupción breve y reversible; drawer para tareas secundarias conservando el contexto; página para tareas largas, enlazables o con navegación propia.
- **Anti-patterns propios:** evita modales anidados y elige el contenedor según si el usuario puede recuperar el contexto tras cerrarlo.
- **Formularios:** asocia labels, valida en el momento adecuado y explica cómo corregir el error; el resto del checklist está en `accesibilidad`.
