# Tarjeta de cambio (single-session DDR)

Registra un cambio funcional terminado en una sesión, cuando no merece expediente.
Tope: 25 líneas. Plantilla cruda: [templates/CARD.md](templates/CARD.md).

## Cuándo

- Una sesión y un efecto observable, sin esquema ni contrato tocado.
- Si toca comportamiento visible, esquema, contrato o configuración: usa spec.
- Si es un commit sin efecto observable: solo changelog.

## Reglas

- `area` y `tarea` son obligatorios (`tarea: -` si no vino del backlog).
- `Cómo verificar` debe ser un comando o un clic concreto.
- `INDEX.md` enlaza la tarjeta; el detalle vive aquí.
- Al cerrar, la fila del backlog se borra; la tarjeta guarda `tarea: B-NNN` para la vuelta atrás.
