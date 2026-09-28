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
