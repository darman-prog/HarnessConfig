# Gate final

## Orden de revisión

1. Alcance y criterios de aceptación; si existe spec (`docs/specs/`), los criterios se leen de ahí (lectura parcial: cabecera + criterios + trazabilidad).
2. Evidencia por criterio: archivo, test, salida o comprobación; nunca “parece correcto”.
3. Diff y archivos modificados: cambios ajenos, secretos, artefactos y documentación.
4. Regresiones y edge cases proporcionales a riesgo.
5. Capas, contratos, migraciones y seguridad cuando correspondan.
6. Validaciones: tests, lint, typecheck, build o revisión manual; identifica lo no ejecutado.

## Salida obligatoria

```text
APROBADO
Evidencia: ...
Acción: ninguna; listo para cerrar.
```

o

```text
BLOQUEADO
Evidencia: ...
Acción: ...
```

Un hallazgo que impide cumplir alcance, seguridad, compatibilidad, datos o validación bloquea. Las mejoras no esenciales pueden quedar como seguimiento y no deben convertirse en un falso bloqueo.
