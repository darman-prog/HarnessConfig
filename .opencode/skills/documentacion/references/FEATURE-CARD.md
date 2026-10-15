# Tarjeta de cambio (single-session DDR)

Registra un cambio funcional terminado en una sesión. Mantén la tarjeta en 20 líneas o menos.

```markdown
---
id: NNN
status: cerrada
date: YYYY-MM-DD
tipo: creación | modificación
---
# Cambio — <slug>

> Una frase: qué cambió.

## Cambio
Descripción directa del cambio funcional.
## Alcance
Archivos nuevos, archivos modificados y lo que no se tocó.
## Verificación
Comando, criterio observado o commit verificable.
## Evidencia
- Commits.
- `file:línea`, salida relevante o ruta del archivo creado.
```

## Reglas

- Registra por unidad funcional, no por commit; los micro-fixes quedan en el changelog.
- Usa `tipo: creación` para artefactos nuevos y `tipo: modificación` para cambios en artefactos existentes.
- `INDEX.md` enlaza la tarjeta; el detalle vive aquí, no en el índice.