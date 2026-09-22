---
name: convenciones-frontend
description: Convenciones de codigo frontend: features/core/shared, interceptores, estados UI, responsive y WCAG. Usar al crear componentes/servicios o revisar estructura sin cambio visual. Para cambios visibles usa ui-ux. No usar en backend puro.
---

# Convenciones Frontend

- Organiza la aplicacion por `features/`, con carga diferida cuando aplique.
- Reserva `core/` para servicios singleton, configuracion e interceptores; usa `shared/` para componentes y utilidades reutilizables sin logica de negocio.
- Mantiene la logica de cada feature cerca de sus componentes, servicios, modelos y tests.
- Usa los interceptores existentes para autenticacion, errores, loading y `traceId`; no dupliques manejo transversal en cada componente.
- Usa el mecanismo de estado ya adoptado por el proyecto; evita estado global para datos locales.
- Usa nombres de archivo `kebab-case` y conserva los patrones de imports y tests existentes.

## UX y accesibilidad

- Mobile-first y responsive en los flujos principales.
- Define estados loading, error, empty, disabled y success cuando correspondan.
- Usa tokens consistentes de spacing 4/8, tipografia, color y radius; prioriza el sistema visual existente.
- Accesibilidad: cumple el checklist base de `accesibilidad` (WCAG 2.2 AA); aqui solo se cubren layout, estados y tokens.
- Cambio visible o interactivo: aplica ademas los criterios de `ui-ux`.

No incluye tutoriales de sintaxis Angular, Tailwind ni otras tecnologias frontend.
