---
name: calidad-cierre
description: Gate final de calidad para una implementación o cambio antes del cierre. Revisar alcance, evidencia, diff, regresiones, arquitectura, riesgos, validaciones, TODOs y documentación; emitir APROBADO o BLOQUEADO.
---

# Calidad de cierre

Carga esta skill al terminar una implementación o cambio, antes de cerrarlo. Es independiente del diseño visual.

- Comprueba alcance y criterios de aceptación con evidencia concreta.
- Revisa el diff completo y busca regresiones, TODOs, documentación desactualizada y artefactos o secretos.
- Evalúa arquitectura y contratos si el cambio cruza capas, datos o API.
- Si no hay plan (cambio pequeno pedido directo), acuerda los criterios de aceptacion con el usuario y dejalos escritos en la entrega; despues verificalos uno a uno con evidencia.
- Orden de fuentes de criterios: (1) feature-spec vigente en `docs/features/NNN-*.md` si el cambio tiene una; (2) la entrega del plan; (3) la entrada de changelog. Al cerrar una feature-spec multi-sesion: verifica criterio a criterio contra su seccion Evidencia y dejala `cerrada`; el changelog queda como registro historico.
- Si existe `docs/project-brain/INDEX.md`: verifica que el cambio no contradiga el cerebro (docs con `status: vigente`); si lo contradice, `BLOQUEADO` con el doc a corregir.
- Revisa edge cases según riesgo y confirma las validaciones ejecutadas o faltantes.
- Emite exclusivamente `APROBADO` o `BLOQUEADO`, con evidencia y acción concreta.
- Si existe un informe de `evaluacion-experiencia` para el release o feature que se cierra con `umbral_gate` incumplido (ej. SUS < 68): emite `BLOQUEADO` hasta plan de corrección. Aplicar solo al informe del alcance que se cierra, no a informes históricos.

No sustituye `testing`, `seguridad`, `auditor` ni `impeccable-doctrina`/`impeccable`; delega o carga esas skills cuando sus ámbitos apliquen.

Consulta [GATE-FINAL.md](references/GATE-FINAL.md) para el formato detallado.
