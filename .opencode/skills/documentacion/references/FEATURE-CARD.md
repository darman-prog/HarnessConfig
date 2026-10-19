# Tarjeta de cambio (single-session DDR)

Registra un cambio funcional terminado en una sesión. Es el registro por defecto de
cualquier cambio con valor observable. Mantén la tarjeta en 25 líneas o menos.

```markdown
---
id: NNN
status: cerrada
date: YYYY-MM-DD
tipo: creación | modificación
---
# Cambio — <slug>

> Una frase: qué cambió y por qué.

## Cambio
Qué hace ahora el proyecto que antes no hacía.
## Por qué
El problema, la decisión o la restricción que lo motiva.
## Dónde mirar
2-3 rutas clave para entenderlo sin leer todo el código.
## Verificación
Comando, criterio observado o commit verificable.
## Evidencia
- Commits.
- `file:línea` o salida relevante.
```

## Reglas

- Registra por unidad funcional, no por commit; los micro-fixes quedan en el changelog.
- Usa `tipo: creación` para artefactos nuevos y `tipo: modificación` para cambios en artefactos existentes.
- `INDEX.md` enlaza la tarjeta; el detalle vive aquí, no en el índice.
