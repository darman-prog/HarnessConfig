# ADR-001 — RTK como dependencia de máquina del harness

**Fecha:** 2026-09-28
**Estado:** Activa
**Versión fijada:** rtk 0.50.0 (winget `rtk-ai.rtk`)
**Decisión:** integrar RTK a nivel de **máquina global** como proxy de compresión de salidas bash para todos los proyectos, activo de facto solo en comandos de test/lint/build (el resto pasa crudo).

## Contexto

El workload real es multi-proyecto con tests por feature (la skill `testing` obliga a testear en cada cambio). La medición del 2026-09-27 (`docs/harness/changelog.md`, entrada de medición) mostró que el input de contexto domina 342x el output y que las salidas de test se repagan en cada turno siguiente (se acumulan en el historial). El truncado existente de OpenCode (`tool_output`) es ciego y destructivo; RTK ofrece compresión semántica con recovery lossless.

## Arquitectura de la integración

| Componente | Path |
|---|---|
| Binario | `C:\Users\damez\AppData\Local\Microsoft\WinGet\Packages\rtk-ai.rtk_Microsoft.Winget.Source_8wekyb3d8bbwe\rtk.exe` (alias `rtk` en PATH de usuario) |
| Plugin OpenCode | `C:\Users\damez\.config\opencode\plugins\rtk.ts` |
| Config | `%APPDATA%\rtk\config.toml` |
| Data (recall/history) | data dir de RTK — verificar con `rtk config recall` |

SHA-256 del binario instalado (ancla de integridad):
`57C9B9723388E9F421BD1F82AABF1BF093EA3012B72EBBBE0EA855D739F1D622`

SHA-256 del plugin (idéntico a `hooks/opencode/rtk.ts` de GitHub, develop):
`6530C131946C84892F9522ABD68D4E513E1E658D8DDBAD1F59388C86EBBCB6BB`

### Parche local: el plugin se auto-deshabilitaba en Windows

Al primer arranque el plugin no reescribía nada. Causa raíz: su probe de inicio es
`` await $`which rtk` `` y **`which` no existe en Windows** (allí el binario de búsqueda en PATH es
`where`). La promesa fallaba, entraba al `catch` y el plugin devolvía `{}` → deshabilitado, en
silencio (fail-open). Ninguna línea de error llega al log de OpenCode.

Parche aplicado (única diferencia respecto de upstream), en `~/.config/opencode/plugins/rtk.ts:12`:

```diff
-    await $`which rtk`.quiet()
+    // Parche local (2026-09-28): `which` no existe en Windows (ahí es `where`),
+    // por lo que el catch dejaba el plugin deshabilitado en este SO.
+    await $`rtk --version`.quiet()
```

`rtk --version` prueba lo mismo (que el binario esté en PATH) y funciona en todas las plataformas.

SHA-256 del plugin **parcheado** (no coincide con upstream a propósito; el desvío queda registrado acá):
`2D8CEF48E83A3A64878B57C6213623E28EB528A831E1F5E6D3D11AB7AD9AE20B`

Verificación del parche (hook invocado fuera de OpenCode, con un `$` que lanza como Bun):

| Comando | Resultado |
|---|---|
| `pip list` | → `rtk pip list` (reescrito) |
| `git status --short` | intacto (exclusión) |
| `python -m pytest tests/ -q` | → `rtk pytest tests/ -q` (reescrito) |
| `npx vitest run` | → `rtk vitest` (reescrito) |
| `npm test` | intacto (RTK no filtra el wrapper `npm`) |

Al hacer `winget upgrade rtk-ai.rtk`, `rtk init -g --opencode` puede sobrescribir el archivo y
**perder este parche**: re-aplicarlo o reportarlo upstream.

El plugin hookuea `tool.execute.before` y delega TODA la decisión en `rtk rewrite` (subproceso). `rtk rewrite` aplica las reglas de `config.toml` compartidas con todos los hosts (`decision.rs`: `hook_rewrite_params()`), por lo que `exclude_commands` es respetado por el path del plugin (verificado en código y en CLI).

## Config activa

```toml
[telemetry]
enabled = false

[hooks]
exclude_commands = ["git", "powershell", "opencode", "ollama"]

[retriever]
mode = "sqlite"
retention_days = 4

[tracking]
enabled = true
history_days = 30

[awareness]
level = "default"   # el agente no sabe que RTK existe; aprende el formato condensado
```

## Riesgos aceptados y mitigaciones

| Riesgo | Mitigación aplicada |
|---|---|
| **R1** — recall DB guarda en disco salidas completas de comandos fallidos (posibles secretos, sin cifrar) | `retention_days = 4` (purga por edad); el volumen lo acota FIFO `max_entries = 200` con gzip, no la retención. Elegido sobre `disabled` porque el recall es el safety net que hace segura la compresión en el flujo de tests. `history` de tracking (strings de comandos, no salidas) reducido de 90 a 30 días |
| **R2** — footgun de permisos: una allowlist `rtk *` convierte a RTK en proxy de ejecución arbitraria | **Regla dura: prohibido allow-listear `rtk *` ni `rtk run`**. En proyectos con allowlists de bash, escribir las reglas en forma `rtk` específica (ej. `rtk vitest *`). El prompt de permiso de OpenCode puede mostrar el comando ya reescrito: las reglas se evalúan contra la forma ejecutada, no la original |
| **R6** — artefactos fuera del perímetro del sync/guardarraíl | Documentados acá y en `estado-actual.md`; se consideran dependencia de máquina (análogo a `git`/`rg`), no config de harness. El changelog queda como rastro |
| **R7 — `npm run lint` se reescribe a `rtk lint`, que despacha a ESLint** (medido en `atlas-magico` el 2026-09-28: el `lint` del proyecto es `tsc --noEmit`; crudo → exit 0, reescrito → `ESLint output: JSON parse failed`, exit 1) | **PENDIENTE DE DECISIÓN.** Opciones: (a) agregar `lint` a `exclude_commands`, (b) aceptar el fallo y documentar que en proyectos con linter distinto de ESLint la reescritura rompe el comando. Mientras no se decida, tratar `npm run lint` como **no confiable** |

## Cobertura real medida en proyectos Node (2026-09-28, `atlas-magico`)

Mapa de reescritura con `rtk rewrite`, y qué significa cada resultado:

| Comando | Reescribe a | ¿Comprime? |
|---|---|---|
| `npx vitest run` | `rtk vitest` | ✅ sí |
| `npm run vitest` | `rtk vitest` | ✅ sí — RTK pela el wrapper `npm run` y matchea el nombre del script |
| `npx tsc --noEmit` | `rtk tsc --noEmit` | ✅ sí |
| `npm run lint` | `rtk lint` | ⚠️ **rompe** si el linter del proyecto no es ESLint (ver R7) |
| `npm run test` | `rtk npm run test` | ❌ no — forma passthrough (rtk envuelve y registra, no filtra) |
| `npm run typecheck` / `coverage` | `rtk npm run …` | ❌ no — mismo passthrough |
| `npm test` | *(sin reescritura)* | ❌ no |
| `vite build` | *(sin reescritura)* | ❌ no |

**Regla operativa:** RTK comprime cuando el comando **nombra al runner** (`vitest`, `jest`, `playwright`, `tsc`, `pytest`), no cuando usa un script genérico (`test`, `build`, `coverage`). `npm run <nombre-del-runner>` sí funciona porque el wrapper se pela.

## Incompatibilidad con vitest 5.x y ahorro real (medido)

| Hallazgo | Evidencia |
|---|---|
| **El filtro de vitest de RTK no parsea vitest 5.x** | `atlas-magico` con vitest 5.0.2 → `[RTK:PASSTHROUGH] vitest parser: All parsing tiers failed`, aunque el JSON que vitest 5 emite es válido (9.627 chars). Con vitest 3.2.7 el mismo filtro funciona (`PASS (3) FAIL (5)`) |
| **Efecto colateral**: el filtro fallido escribe `.vitest/json/output.json` dentro del proyecto | Verificado y limpiado; el proyecto queda con artefacto no ignorado por `.gitignore` |
| **El ahorro real es modesto, no −90%** | Mismo entorno (vitest 3.2.7, 8 tests, 5 fallos): crudo 101 líneas / 8.118 chars vs RTK 62 líneas / 6.438 chars → **−20,7% chars, −38,6% líneas**. El motivo: RTK conserva los stack traces completos de vitest, que son el grueso de la salida |

Consecuencia para el gate: en proyectos con **vitest 5 o superior**, RTK no comprime los tests (y ensucia el repo). En proyectos con **vitest ≤4**, el ahorro es real pero de ~20% de caracteres, no de 90%.

## Gate de decisión a 14 días (2026-10-12)

## Notas de diseño verificadas en fuente

- `vitest`/`vitest run` colapsan a `rtk vitest` **por diseño** (test oficial en `registry.rs:5719`): el wrapper internamente arma `run` + `--reporter=json` (`vitest_cmd.rs:297`) y fuerza no-watch — no hay riesgo de sesiones watch colgadas
- Comandos con sustitución de comando, heredocs o redirecciones a archivo **nunca se reescriben** (`decision.rs`, gate "unattestable")
- Deny siempre gana; comandos ya-rtk son identidad y no-op
- `npm test` (wrapper) pasa **crudo**: RTK solo filtra runners directos (vitest, tsc, pytest…). Para comprimir, los agentes deben invocar el runner directo (`npx vitest run`, `pytest -q`)
- `python manage.py test`: sin filtro built-in (passthrough). Si el gate de 14 días muestra que duele, se abre plan mini de `filters.toml` con el DSL real de `src/filters/README.md` + `rtk trust`
- El plugin ignora el exit code 3 (ask) de `rtk rewrite` y aplica la reescritura igual; la aprobación queda en el flujo de permisos de OpenCode sobre el comando reescrito

## Política de upgrade

Actualiza RTK **solo** si:
1. Fix de seguridad crítico, o
2. El changelog menciona mejora en filtros que se usan

Obligatorio tras cada upgrade: re-ejecutar los 4 probes de verificación (`rtk rewrite "git status --short"`, `"vitest run"`, `"powershell -File sync-global.ps1"`, `"python manage.py test"`) y esperar los mismos resultados. Un filtro nuevo sobre una herramienta que el harness parsea crudo es regresión silenciosa: al upgrade, revisar changelog de RTK y agregar exclusiones si aplica.

## Gate de decisión a 14 días (2026-10-12)
| Métrica | Instrumento | Acción si falla |
|---|---|---|
| Ahorro de bash output | `rtk gain --daily` + `opencode stats` antes/después | <5% del input de sesión → desinstalar |
| Correctness | `rtk gain --recalls` | recalls densos en tests → ajustar exclusiones o desinstalar |
| Regresión de workflow | diff de commits/pushes/logs del harness | parse roto → revert inmediato |

## Reversión

```powershell
rtk config recall                                   # 1. localiza data dir real
rtk init -g --uninstall                             # 2. plugin fuera
winget uninstall rtk-ai.rtk                         # 3. binario fuera
Remove-Item -Recurse -Force "$env:APPDATA\rtk"      # 4. config fuera
Remove-Item -Recurse -Force <data dir del paso 1>   # 5. recall/history fuera
```
