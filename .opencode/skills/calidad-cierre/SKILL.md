---
name: calidad-cierre
description: Gate de cierre de una implementación: alcance, diff, regresiones; APROBADO o BLOQUEADO.
---

# Calidad de cierre

Carga esta skill al terminar una implementación o cambio, antes de cerrarlo. Es independiente del diseño visual.

- Comprueba alcance y criterios de aceptación con evidencia concreta.
- Revisa el diff completo y busca regresiones, TODOs, documentación desactualizada y artefactos o secretos.
- Evalúa arquitectura y contratos si el cambio cruza capas, datos o API.
- Si no hay plan (cambio pequeno pedido directo), acuerda los criterios de aceptacion con el usuario y dejalos escritos en la entrega; despues verificalos uno a uno con evidencia.
- Orden de fuentes de criterios: (1) feature-spec vigente en `docs/features/NNN-*.md` si el cambio tiene una; (2) la entrega del plan; (3) la entrada de changelog. Al cerrar una feature-spec multi-sesion (umbral canonico: `documentacion` §docs/features): verifica criterio a criterio contra su seccion Evidencia y dejala `cerrada`; el changelog queda como registro historico.
- Registro del cambio: comprueba que existe la feature-spec o la tarjeta en `docs/features/` segun su tamaño, o que el cambio es un micro-fix con fila en el changelog. Si falta, es BLOQUEADO hasta registrarlo.
- Si existe `docs/project-brain/INDEX.md`: verifica que el cambio no contradiga el cerebro (docs con `status: vigente`); si lo contradice, `BLOQUEADO` con el doc a corregir.
- Revisa edge cases según riesgo y confirma las validaciones ejecutadas o faltantes.
- Emite exclusivamente `APROBADO` o `BLOQUEADO`, con evidencia y acción concreta.
- Si existe un informe de `evaluacion-experiencia` para el release o feature que se cierra con `umbral_gate` incumplido (ej. SUS < 68): emite `BLOQUEADO` hasta plan de corrección. Aplicar solo al informe del alcance que se cierra, no a informes históricos.

No sustituye `testing`, `seguridad`, `auditor` ni `impeccable-doctrina`/`impeccable`; delega o carga esas skills cuando sus ámbitos apliquen.

Consulta [GATE-FINAL.md](references/GATE-FINAL.md) para el formato detallado.
