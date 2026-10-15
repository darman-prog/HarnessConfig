# Comparar librerías de componentes UI

Metodología para elegir entre librerías externas (o decidir no usar ninguna) con evidencia verificable. La búsqueda web sigue el protocolo de `investigacion-web`; aquí solo vive el criterio de comparación.

## 1. Encuadre
- Stack del proyecto, objetivo concreto y restricciones (licencia permitida, peso máximo, entornos).
- Si el proyecto ya tiene sistema propio, la opción por defecto es reutilizarlo: conservar coherencia antes de introducir variantes.

## 2. Fuentes (verificables, con fecha)
- Documentación oficial, repositorio, releases y changelog.
- Issues y discusiones sobre accesibilidad y mantenimiento.
- Estadísticas de bundle/peso y actividad (commits recientes, respuesta a issues).

## 3. Criterios de comparación
| Criterio | Qué verificar |
| Licencia | Compatible con el uso del proyecto; anota la versión |
| Accesibilidad | Teclado, foco, ARIA y contraste; el canon es `accesibilidad` |
| Peso/bundle | Costo real importando solo lo necesario |
| Mantenimiento | Actividad reciente, respuesta a issues, releases |
| Estabilidad de API | Cambios rompedores por versión mayor |
| Theming/tokens | Variables propias frente a tokens del proyecto |
| Encaje con el stack | Framework, versión y dependencias que arrastra |
| Comunidad | Adopción, ejemplos y calidad de la documentación |

## 4. Regla de decisión
- Puntúa cada criterio por candidato; documenta ganador y segundo lugar con su porqué.
- Sin ganador claro o sin necesidad real: no introducir librería (cero dependencias gana por defecto).
- Si el cambio es visible, pasa el resultado por `frontend-design-review`.

## 5. Gate de adopción
- Nombre reservado para un futuro subagente: `ui-research`. Solo se crea si esta metodología se usa en 3 o más sesiones reales.