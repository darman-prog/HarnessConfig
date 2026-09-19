---
name: calidad-cierre
description: Gate final de calidad para una implementación o cambio antes del cierre. Revisar alcance, evidencia, diff, regresiones, arquitectura, riesgos, validaciones, TODOs y documentación; emitir APROBADO o BLOQUEADO.
---

# Calidad de cierre

Carga esta skill al terminar una implementación o cambio, antes de cerrarlo. Es independiente del diseño visual.

- Comprueba alcance y criterios de aceptación con evidencia concreta.
- Revisa el diff completo y busca regresiones, TODOs, documentación desactualizada y artefactos o secretos.
- Evalúa arquitectura y contratos si el cambio cruza capas, datos o API.
- Si el cambio supera el umbral canonico (fuente unica: `PLAN-TECNICO.md` de la skill `ingenieria-software`; cargalo si hace falta): verifica que `docs/specs/NNN-*.md` existe, con criterios de aceptacion con evidencia y estado `implementada`. Lee solo cabecera + criterios + trazabilidad (`offset`/`limit`). Falta la spec o estado != `implementada` -> `BLOQUEADO`. Para el tope, cuenta lineas con la tool `read` en `limit: 1` (el encabezado "of N" da el total); si supera el tope (derivado de `PLAN-TECNICO.md`) -> `WARNING` "dividir o recortar". Al aprobar, indica al ejecutor marcar la spec `implementada` + `updated` y relee esa linea antes de cerrar.
- Revisa edge cases según riesgo y confirma las validaciones ejecutadas o faltantes.
- Emite exclusivamente `APROBADO` o `BLOQUEADO`, con evidencia y acción concreta.

No sustituye `testing`, `seguridad`, `auditor` ni `impecable`/`impeccable`; delega o carga esas skills cuando sus ámbitos apliquen.

Consulta [GATE-FINAL.md](references/GATE-FINAL.md) para el formato detallado.
