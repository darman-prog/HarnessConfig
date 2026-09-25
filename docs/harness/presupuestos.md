# Presupuestos del harness

> **Para quién:** dev junior con TDAH — cifras y su porqué; leer en 1 min.
> **Fuente única:** estos topes viven aquí. `scripts/harness-budget.ps1` los implementa como constantes y falla (exit 1) si se exceden, nombrando archivo y valor.

| Constante | Valor | Qué mide |
| --- | --- | --- |
| `MAX_AGENTS_MD_TOTAL` | 60 líneas | `AGENTS.md`: se inyecta en **cada** sesión |
| `MAX_AGENTS_TOTAL` | 310 líneas | Los 8 archivos de `.opencode/agents/` en total |
| `MAX_AGENT` | 45 líneas | Un agente individual |
| `MAX_SKILL` | 65 líneas | Una skill que se auto-activa |
| `MAX_SKILL_EXENTA` | 180 líneas | Exentas: vendor o manuales (se cargan bajo demanda) |
| `MAX_DESC` | 45 palabras | `description` de una skill (es su gatillo) |
| `MAX_DESC_MANUAL` | 25 palabras | `description` de las 3 skills manuales |

**Exentas del tope de líneas** (`MAX_SKILL_EXENTA`): `impeccable` y `frontend-design-review` (vendor) · `habilidades-ofimaticas`, `informe-docx` y `notion-flow` (manuales).
**Con description de 25 palabras** (`MAX_DESC_MANUAL`): `habilidades-ofimaticas`, `informe-docx` y `notion-flow`.

## Por qué

- Los topes se fijaron el 2026-09-21 en `docs/specs/001` con una medición A/B (−565 tokens/sesión, −4,3 %). Desde el 2026-09-25 viven aquí porque esa spec pasa a ser archivo histórico: un presupuesto no debe depender de un doc que ya no manda.
- `AGENTS.md` se lee siempre → 1 línea de más se paga en cada sesión. Los agentes y las skills solo se pagan cuando se invocan, por eso tienen límites más altos.
- Las manuales y las vendor se cargan bajo demanda → toleran más cuerpo; su `description`, que sí se lee siempre, va corta.
- Los conteos se derivan por glob (`Get-ChildItem`), no hay cifras fijadas en el script: agregar o quitar un archivo no requiere tocar el presupuesto.

## Verificar

```powershell
powershell -NoProfile -File .\scripts\harness-budget.ps1
```

Exit 0 = todo en presupuesto. Exit 1 lista cada violación con archivo y valor. Los bloques numerados del script aplican, además, contratos: frontmatter fail-closed, `mode`/`task` explícitos, allowlists válidas, roster coherente, `.gitattributes`, la convención de docs en `docs/harness` y `external_directory` sin `allow *`.

`docs/specs/*` ya no tiene tope ni validación: es archivo histórico (el 2026-09-25 se retiró el sistema de specs).
