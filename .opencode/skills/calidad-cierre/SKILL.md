---
name: calidad-cierre
description: Gate final de calidad para una implementación o cambio antes del cierre. Revisar alcance, evidencia, diff, regresiones, arquitectura, riesgos, validaciones, TODOs y documentación; emitir APROBADO o BLOQUEADO.
---

# Calidad de cierre

Carga esta skill al terminar una implementación o cambio, antes de cerrarlo. Es independiente del diseño visual.

- Comprueba alcance y criterios de aceptación con evidencia concreta.
- Revisa el diff completo y busca regresiones, TODOs, documentación desactualizada y artefactos o secretos.
- Evalúa arquitectura y contratos si el cambio cruza capas, datos o API.
- Revisa edge cases según riesgo y confirma las validaciones ejecutadas o faltantes.
- Emite exclusivamente `APROBADO` o `BLOQUEADO`, con evidencia y acción concreta.

No sustituye `testing`, `seguridad`, `auditor` ni `impecable`/`impeccable`; delega o carga esas skills cuando sus ámbitos apliquen.

Consulta [GATE-FINAL.md](references/GATE-FINAL.md) para el formato detallado.
