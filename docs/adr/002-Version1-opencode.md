# ADR-002 — OpenCode V1.19.3 en vez de V2 (API de plugins incompatible)

## Contexto
La instalación pasó a la V2 de `@opencode/cli`. Esa versión cambió la API de plugins: los dos plugins del harness (`notify-windows.js` y `rtk.ts`) dejaron de funcionar, y con ellos la notificación de escritorio y la compresión de salidas de tests. El harness depende de ambos para operar con coste de contexto bajo. La V1.19.3 (`opencode-ai`) mantiene la API que leen los plugins actuales.

## Decision
Quedarnos en `opencode-ai@1.19.3` (V1) y no usar `@opencode/cli` (V2) mientras la API de plugins de V2 no sea compatible con los plugins del harness.

## Consecuencias
- Positivas: los plugins (`notify-windows.js`, `rtk.ts`) siguen cargando; se conserva la compresión de salidas y las notificaciones sin trabajo extra.
- Negativas: V1 queda congelada en 1.19.3; las mejoras de V2 no están disponibles y habría que revisar cada cambio de la API de plugins al migrar.
- Operativas: toda subida de versión exige verificar que los dos plugins siguen cargando (`[notify-windows] plugin cargado` en el log de arranque) y volver a esta guía si se rompe.

## Alternativas descartadas
- **Migrar los plugins a la API de V2**: trabajo de adaptación sobre código vendorizado, con la V2 todavía sin soporte de la API que usan; se descarta por coste/beneficio.
- **Quedarse en V2 sin plugins**: se pierde la compresión de salidas de tests (medida en 38-93% de ahorro por invocación) y las notificaciones; se descarta por regresión de coste.
- **Volver a V1 más adelante, cuando V2 sea compatible**: es la vía de upgrade prevista; no requiere decisión ahora.

## Reversión
El procedimiento paso a paso está en [downgrade-opencode-v1.md](../guias/downgrade-opencode-v1.md).
