# Feature-spec (DDR): una por feature multi-sesion

Fuente de verdad de una feature que dura >1 sesion o toca >=2 agentes: se planea,
se ejecuta y se cierra desde aqui. Se persiste en `docs/features/NNN-<slug>.md`.
Cambios pequenos: changelog, sin spec (umbral de `plan`).

```markdown
---
id: NNN
status: borrador          # borrador | aprobada | en-curso | cerrada
created: YYYY-MM-DD
updated: YYYY-MM-DD
agentes: [plan, build]    # quien participa; el umbral exige >=2 o >1 sesion
sesiones_estimadas: 2
---
# Feature NNN: <slug>

## Objetivo (resultado observable, no tarea)
## Alcance / No-alcance
## Criterios de aceptacion (verificables: un comando o condicion por criterio)
## Pasos numerados (cada paso = unidad de commit: cambio, validacion, mensaje)
## Evidencia (al cerrar: file:linea, comandos y salidas por criterio)
## Cierre (fila resumen en changelog; ADR si hubo decision de arquitectura)
```

## Ciclo de vida

- `plan` la redacta en su entrega (no edita); el ejecutor persiste el archivo con `status: en-curso` al arrancar el paso 1.
- La spec manda mientras `status` != `cerrada`: tras compactar contexto, se reanuda leyendo solo este archivo (no el changelog completo).
- Al cerrar: `calidad-cierre` verifica criterio a criterio contra la seccion Evidencia; el changelog queda como registro historico con la fila resumen.
- Spec `cerrada` no se reescribe: una decision nueva abre otra feature o un ADR.