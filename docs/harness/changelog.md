# Actualizaciones del harness — registro

> **Para quién:** dev junior con TDAH — una entrada por cambio, secciones cortas y tablas; leer en 2 min.
> **Regla:** append-only; la entrada más reciente va arriba. Cada entrada dice qué cambió, por qué, cómo se verifica y cómo se revierte; si el cambio dura más de una sesión o va entre 2 o más agentes, además **qué criterios de aceptación** tenía.
> **Alcance:** cambios al harness (config global, skills, agentes, scripts). El detalle de arquitectura está en la [auditoría v2](auditoria-v2.md) y el flujo operativo en el [pipeline](pipeline.md).

## Historial

| Fecha | Cambio | Alcance | Estado |
| --- | --- | --- | --- |
| 2026-09-25 | Colisión de skills resuelta: el wrapper con typo pasa a `impeccable-doctrina` y la tabla nombra las dos | `skills/impecable/` → `skills/impeccable-doctrina/`, `AGENTS.md`, `ui-ux.md`, 4 skills | Aplicado; dos skills declaraban el mismo `name` y el registro publicaba una al azar; guardarraíl exit 0; falta el humo del flujo UI |
| 2026-09-25 | Cerebro documental del harness: `docs/project-brain/` con índice y arquitectura; `contexto-proyecto` y `calidad-cierre` lo consultan ante la duda | `docs/project-brain/{INDEX,ARCHITECTURE}.md`, `contexto-proyecto`, `calidad-cierre`, `docs/README.md` | Aplicado; 0 enlaces rotos, description 44/45 palabras, guardarraíl exit 0; falta el humo "¿qué hace el agente ante una duda?" |
| 2026-09-25 | Fuera sdd-lite: el plan no produce specs; los criterios de un cambio largo viajan en el changelog y las decisiones de arquitectura en `docs/adr/`; los topes pasan a doc propio | `PLAN-TECNICO.md`, `plan.md`, `auditor.md`, 5 skills, `AGENTS.md:27`, `harness-budget.ps1` (9 bloques), `pipeline.md`, `estado-actual.md`, `README.md`, `docs/specs/003` | Aplicado; criterios: grep de `docs/specs` = 0, guardarraíl exit 0 con 9 bloques, sync con identidad OK; falta reiniciar TUI y humos |
| 2026-09-25 | `external_directory` vuelve a ser allowlist (`*` ask + allow de las 2 carpetas del harness) y `AGENTS.md` gana las reglas "ante la duda" y "fuera del repo" | `~/.config/opencode/opencode.jsonc` (global, sin commit), `AGENTS.md:51`, `docs/harness/estado-actual.md:138` | Aplicado; el `*` ask global anulaba las allowlists internas de opencode (causa del ruido al delegar); falta reiniciar y el humo |
| 2026-09-24 | Convencion de documentacion: la doc del harness vive en `docs/harness/` (antes `.opencode/Logs/`) + indice en `docs/README.md` | 4 docs movidos, `docs/specs/002`, `harness-budget.ps1` | Aplicado; check nuevo, enlaces verificados e historial preservado (git rename) |
| 2026-09-24 | Permiso del harness: `external_directory` a `ask` (y `logLevel: WARN` al cerrar los humos) | `~/.config/opencode/opencode.jsonc` (global, sin commit) | `ask` aplicado; `WARN` pendiente de los humos |
| 2026-09-24 | Sync fail-closed: dry-run de purga, espejo del repo y prune del log | `sync-global.ps1` | Aplicado; gate probado con archivo basura y log respaldado |
| 2026-09-24 | Guardarraíl: las skills tampoco pueden mandar a delegar en un primary (incluye `references/`) | `scripts/harness-budget.ps1` | Aplicado; 2 negativos y 3 legales sin falso positivo |
| 2026-09-24 | Documentacion del harness: estado actual con indices + pipeline corregido con los roles nuevos | `.opencode/Logs/estado-actual-harness.md` (nuevo), `pipeline-ejecucion-tareas.md`, `auditoria-skills-agentes-v2.md` | Aplicado; referencias por seccion (sin lineas, que se pudren) |
| 2026-09-24 | Roles de agente reales: `ui-ux` y `backend-expert` a `subagent`, allowlists `permission.task` fail-closed, roster sincronizado, LF fijado en el repo | 8 agentes + `AGENTS.md` + `scripts/harness-budget.ps1` + `.gitattributes` | Aplicado; 6 checks verificados con fixture; falta reiniciar TUI y smoke |
| 2026-09-23 | Fail-closed real: cierre de frontmatter obligatorio y sync sin guardarraíl = error | `scripts/harness-budget.ps1`, `sync-global.ps1` | Aplicado; verificado con fixtures |
| 2026-09-23 | Skill `comunicacion-asertiva` (doctrina de redacción, densidad y diagramas) obligatoria en toda tarea | `.opencode/skills/comunicacion-asertiva/` + `AGENTS.md` + `uso-eficiente` §4 + guardarraíl | Aplicado; +45 tok fijos y ~+310 tok/tarea; falta reiniciar TUI y smoke de formato |
| 2026-09-23 | Gatillos de patrones (pool, proxy) y probes de trigger en el guardarraíl | `arquitectura` (description + `references/PATRONES.md`), `convenciones-frontend` (description), `AGENTS.md`, `scripts/` | Aplicado; +24 tok/sesión; falta reiniciar TUI y smoke |
| 2026-09-22 | Remediación de auditoría: guardarraíl fail-closed, allowlist de permisos, routing UI sin `npx`, descripciones recortadas | `scripts/harness-budget.ps1` + `sync-global.ps1` + agentes + 10 `SKILL.md` + `AGENTS.md` + global `opencode.jsonc` | Aplicado; verificado con fixture, guardarraíl verde y A/B de tokens (−565, −4,3%); falta reiniciar TUI |
| 2026-09-21 | Adopción de skill de review UI (`frontend-design-review`, Microsoft, adaptada) | `.opencode/skills/frontend-design-review/` + `AGENTS.md` + guardarraíl | Aplicado; smoke en TUI pendiente de reinicio |
| 2026-09-21 | Routing UI sin doble activación (filas diferenciadas + punteros cross-skill) | `AGENTS.md` + skills `convenciones-frontend`/`ui-ux` | Aplicado y medido: −0,25% (ruido); se descarta fusionar skills |
| 2026-09-19 | Notificaciones de escritorio vía plugin (Windows Terminal 1.24 ignora OSC 777) | Global (`~/.config/opencode/plugins/notify-windows.js`) | Verificado en TUI: sonido + toast al pedir permiso con el terminal fuera de foco |
| 2026-09-19 | Sonidos y notificaciones de atención en la TUI | Global (`~/.config/opencode/tui.json`) | Parcial: sonidos OK; el banner nativo no llega (ver entrada siguiente) |

<a id="sec-impeccable-doctrina-2026-09-25"></a>
## 2026-09-25 — `impeccable-doctrina`: dos skills, dos nombres

**Qué:** el wrapper del proyecto (flujo + detector local, 2 archivos) vivía en `.opencode/skills/impecable/` —typo— declarando `name: impecable`, **igual que el vendor oficial** en `.opencode/skills/impeccable/` (45 archivos). Con el mismo `name`, el registro solo podía publicar una y el log lo avisaba (`duplicate skill name`, `opencode.log`): el cuerpo que cargaba dependía del orden, y en los últimos arranques ganaba el vendor global. Renombrado a `impeccable-doctrina/` con `git mv` (cuerpo intacto, `name` propio y description que dice qué es y cuándo se usa). La fila de cambio UI visible de `AGENTS.md` nombra las dos; actualizados los punteros en `ui-ux.md`, `ui-ux`, `calidad-cierre`, `frontend-design-review`, `tdd` e `inicio-proyecto`.

**Por qué:** con el duplicado, la doctrina del harness (detector local sin `npx`, una sola pasada, anti-doble-review) podía no cargarse nunca. El guardarraíl no lo detectaba porque valida `name == carpeta` y **cada carpeta era coherente consigo misma**; el defecto estaba en que dos carpetas distintas declaraban el mismo nombre.

**Verificación:** guardarraíl exit 0 con el routing bidireccional en verde (34 skills, `AGENTS.md` 60/60, agentes 310/310); el token canónico se comparó **byte a byte** contra el nombre de la carpeta en los 8 archivos tocados (0 variantes inválidas); el wrapper sigue apuntando al launcher del vendor (`.opencode/skills/impeccable/scripts/impeccable`), que no se movió. `sync-global.ps1` purgará la carpeta con typo del global.

**Rollback:** revertir el commit y hacer el `git mv` de vuelta; el sync repropaga el global.

<a id="sec-cerebro-2026-09-25"></a>
## 2026-09-25 — Cerebro documental del harness

**Qué:** (1) `docs/project-brain/INDEX.md` enruta el conocimiento del harness **sin duplicarlo**: la tabla apunta a `docs/harness/*` (estado-actual, pipeline, presupuestos, changelog), marca la auditoría y los specs como históricos y anota que `docs/adr/` nace con el primer ADR. (2) `docs/project-brain/ARCHITECTURE.md` describe las 6 capas (bootstrap, doctrina, contratos, comandos, verificación, documentación), los 6 invariantes (presupuesto, espejo, permisos, fail-closed, sin hot-reload, un dato en un solo lugar), el flujo de una tarea y qué no va en ningún sitio. (3) `contexto-proyecto` deja de exigir que la tarea "toque" el cerebro: también se carga ante duda sobre el estado del proyecto, leyendo `INDEX.md` antes de preguntar o asumir. (4) `calidad-cierre` cumple la promesa que la propia skill hacía: si existe `INDEX.md`, verifica que el cambio no lo contradiga.

**Por qué:** el usuario pidió que el agente vaya leyendo el project-brain o el `AGENTS.md` ante las dudas, en lugar de acumular specs que saturan. `AGENTS.md` §Tokens y contexto ya lo ordena para el bootstrap ("ante la duda: lee este archivo y `docs/project-brain/INDEX.md`"); faltaba la memoria y las dos skills que la consultan. La doctrina ya estaba escrita —`pipeline.md` titula su cierre "DoD + gate + cerebro"—; lo que no existía era la memoria.

**Criterios de aceptación:** (1) los enlaces del cerebro resuelven (0 rotos); (2) la `description` de `contexto-proyecto` respeta el tope de 45 palabras (44); (3) guardarraíl exit 0; (4) `sync-global.ps1` exit 0 con identidad OK; (5) en la TUI, una pregunta con duda hace que el agente lea `INDEX.md` en vez de preguntar o suponer.

**Verificación:** enlaces del cerebro comprobados (0 rotos), description contada, guardarraíl verde y sync con identidad OK. Pendiente el criterio 5, que necesita reiniciar OpenCode.

**Rollback:** revertir `3c3b203`, `eec0798` y `359f0f0` y volver a correr el sync. `AGENTS.md:51` sigue siendo válido sin cerebro (dice "si existe").

<a id="sec-sdd-fuera-2026-09-25"></a>
## 2026-09-25 — Fuera sdd-lite: el plan no produce specs

**Qué:** (1) `PLAN-TECNICO.md` pierde la sección "Persistencia como spec" (umbral canónico, formato, topes, numeración, autoría, ciclo de vida) y conserva la plantilla de plan de 9 secciones. (2) `plan.md` deja de anunciar la spec: el bullet de "Al entregar el plan" y el ítem 6 de su DoD se **reemplazan** por la regla barata — si el cambio dura más de una sesión o va entre 2+ agentes, la entrega trae la entrada de changelog con sus criterios de aceptación y, si hubo decisión de arquitectura no trivial, el ADR en `docs/adr/`; `auditor.md` deja de listar "specs" entre lo que puede editar. (3) Las skills dejan de citar el sistema: fuera el gate "sin spec → BLOQUEADO" de `calidad-cierre` (sus criterios se leen del plan o se acuerdan en la puerta), `documentacion` pierde la fila de `docs/specs/` y su description gatilla con "guía, tutorial, taller, manual" (`docs/guias/`, nunca un plan), y `contexto-proyecto` + `TOKEN-SAVING.md` pierden sus referencias. (4) `AGENTS.md:27` ensancha la fila de ruteo a "READMEs, ADRs, guías, tutoriales". (5) Los topes salen de la spec 001 y viven en `docs/harness/presupuestos.md`, que el guardarraíl exige que exista y cita como fuente única. (6) El guardarraíl pierde `$MAX_SPEC` y el bloque "6) Specs del repo": quedan 9 bloques, renumerados. (7) `pipeline.md` y `estado-actual.md` reflejan el flujo nuevo y registran 3 fricciones resueltas.

**Por qué:** al pedir una guía técnica para un taller, el umbral canónico la convirtió en una spec de la tarea: el sistema de specs capturaba peticiones de documentación. Además, tantas specs acabarían saturando el contexto de cada sesión, y el project-brain ya cubre la memoria del proyecto. Nada lo reemplaza como sistema: la intención de cada cambio vive en el changelog (que ya se mantenía con rigor) y las decisiones de arquitectura en `docs/adr/`, que es la convención que ya definía la skill `documentacion`.

**Criterios de aceptación:** (1) `grep` de `docs/specs|umbral canonico|MAX_SPEC` en agentes, skills y `AGENTS.md` → 0 coincidencias (salvo el puntero genérico a la plantilla de plan y los falsos positivos de "Figma specs"/vendor). (2) Guardarraíl exit 0 con 9 bloques numerados, `AGENTS.md` en 60 líneas y agentes ≤310. (3) `sync-global.ps1` exit 0 con identidad OK. (4) Una petición de "guía técnica / taller / tutorial" produce un `.md` en `docs/guias/`, no una spec ni un plan. (5) `docs/harness/presupuestos.md` existe y el guardarraíl lo cita como fuente única.

**Verificación:** las 7 cifras de `presupuestos.md` coinciden con las constantes del script; los enlaces `.md` de `docs/` resuelven; `sync-global.ps1` exit 0 con `skills=34 agentes=8 commands=1`; los fixtures de permisos siguen fallando como deben. Pendiente: reiniciar OpenCode y comprobar los criterios 3 y 4 en la TUI.

**Rollback:** revertir los 6 commits del lote (`55a0ac8`, `5ff16a8`, `342ea02`, `36c2db7`, `af4dcd8`, `0d503b7`) y este. Los specs 001-003 permanecen en el repo como archivo, así que nada se pierde.

<a id="sec-external-allowlist-2026-09-25"></a>
## 2026-09-25 — `external_directory`: allowlist del harness + reglas de contexto

**Qué:** (1) en `~/.config/opencode/opencode.jsonc` (global, **sin commit**), `permission.external_directory` pasa de `{"*": "ask"}` a `{"*": "ask", "~/.config/opencode/**": "allow", "~/.local/share/opencode/**": "allow"}` — el orden importa: gana la última regla y la config del usuario se fusiona después que las allowlists internas de opencode. (2) `AGENTS.md` §Tokens y contexto gana, **en la misma línea** (sin añadir líneas: el tope es 60/60), dos reglas: *"Ante la duda: lee este archivo y `docs/project-brain/INDEX.md` (si existe) antes de preguntar o asumir"* y *"Fuera del repo: no explores rutas externas salvo que la tarea nombre la ruta o el repo no responda"*. (3) `estado-actual.md` refleja la política vigente.

**Por qué:** el `*` ask global **anulaba** las allowlists internas de opencode (temp, skills descubiertas, referencias globales, `tool-output`), así que cada delegación a subagente disparaba el permiso por rutas que el harness ya tenía permitidas. Verificado contra el schema (`opencode.ai/config.json`), la doc de permisos y el código de opencode v1.18.32: un subagente hereda las reglas y el estado `approved` del primario (no reinicia), `once` no cachea y `always` sí. La allowlist de las 2 carpetas ya era la decisión de `docs/specs/001:92`; lo que faltaba era volver a ella.

**Verificación:** el JSONC sigue válido; el efecto requiere reiniciar OpenCode (la config no es hot-reload). Pendiente el humo: (a) un subagente que lee `~/.config/opencode/**` o `~/.local/share/opencode/**` no pregunta; (b) una lectura fuera de esas dos rutas sí pregunta. Si aún aparece algún permiso (p. ej. el temp del harness), se mide antes de ampliar la allowlist.

**Rollback:** en `opencode.jsonc`, dejar `permission.external_directory` como `{"*": "ask"}` (o restaurar las 4 reglas de la entrada del 2026-09-24). Requiere reiniciar OpenCode.

<a id="sec-roles-2026-09-24"></a>
## 2026-09-24 — Roles reales de agente: invocabilidad, permisos `task` y roster

**Qué:** (1) `ui-ux` y `backend-expert` pasan de `mode: primary` a `mode: subagent` (un primary no es invocable por `Task`) y `AGENTS.md` los mueve al roster de subagents: quedan 2 primarios (`build`, `plan`) y 7 subagents. (2) Cada agente declara `permission.task`: `build` con los 7, `plan` con `backend-expert`/`auditor`/`explore` (pre-flight de seguridad, arquitectura o contratos), `ui-ux`/`backend-expert` con `explore`, y los 4 subagents con `task: deny` (sin `task` el default documentado es `allow`). (3) Textos alineados a esa topología: `build` gana el mapa de orquestación (reemplaza el bloque que repetía el Paso 0, −1 línea), los subagents "reportan para que…" en vez de "se delegan a…", 3 listas de skills fijas pasan a puntero a la tabla, y `tdd` ya no manda a un primary. (4) `.gitattributes` fija `eol=lf` para `*.md`, `*.ps1`, `*.json`, `*.jsonc`. (5) Guardarraíl: 6 checks nuevos.

**Por qué:** auditoría de los `.md` de agentes: "delega a X" no se podía cumplir (X era primary y `Task` no lo ofrece), ningún primary declaraba a quién puede lanzar, 22 archivos del harness tenían finales mezclados en la carpeta de trabajo y el contrato de LF dependía del `git config` de cada máquina.

**Verificación:** guardarraíl verde (skills=34, AGENTS.md=60, agentes=308/310); fixture con 5 agentes en conflicto → los 6 checks fallan nombrando el archivo (exit 1) y `explore` se acepta como built-in; `git ls-files --eol` → índice y carpeta de trabajo 100% LF tras normalizar, sin diff de contenido.

**Rollback:** revertir los 4 commits y borrar `.gitattributes`. Reiniciar OpenCode para que cargue los roles nuevos.

<a id="sec-sync-failclosed-2026-09-24"></a>
## 2026-09-24 — Sync fail-closed: purga auditable, espejo del repo y prune del log

**Qué:** (1) `sync-global.ps1` ahora tiene un **dry-run**: enumera qué se borraría en `skills/`, `agents/` y `commands/` y **para** si hay algo (se aprueba con `-ForcePurge`). (2) La copia usa `/MIR` solo en esas 3 carpetas, así que borra lo obsoleto sin tocar `opencode.jsonc`, `tui.json`, `plugins/`, `package.json` ni `node_modules/`. (3) Verifica que el global sea **espejo del repo**: los mismos `SKILL.md` con el mismo contenido (compara texto normalizado, CRLF/LF no cuenta) y el mismo número de archivos; si difieren o sobran → `exit 1`. (4) Trunca `opencode.log` si supera 10 MB. Antes copiaba con `/E` (no borraba nunca) y solo validaba el frontmatter del global.

**Por qué:** revisión de fugas del plan. El `/MIR` sin dry-run podía borrar algo tuyo y el global podía divergir del repo en silencio (una copia vieja sombreando la nueva, la misma clase de fallo que el incidente de `inicio-proyecto` del 15-09). Los 8 WARN `duplicate skill name` que aparecen en cada arranque son inofensivos **porque** el check garantiza identidad.

**Verificación:** corrida sin `-ForcePurge` con un archivo basura en el global → lo lista y para, el archivo sobrevive; corrida con `-ForcePurge` → lo borra y revalida (`skills=34`, identidad OK). La primera versión del parser falló (robocopy en español escribe `*Directorio EXTRA`, no `*deleting`) y borró sin pedir permiso: lo detectó la propia prueba y se corrigió antes de commitear. `opencode.jsonc`, `tui.json`, `plugins/` y `node_modules/` verificados intactos. Log: 25,3 MB respaldados en `opencode-historico-2026-07-03_a_2026-09-24.log.bak` y truncados a 0 MB.

**Rollback:** `git revert` del commit. El `-ForcePurge` es opt-in: sin él el sync nunca borra.

<a id="sec-check-skills-2026-09-24"></a>
## 2026-09-24 — Guardarraíl: las skills tampoco pueden mandar a delegar en un primary

**Qué:** check nuevo en `scripts/harness-budget.ps1` (bloque 2e): escanea todos los `.md` de `.opencode/skills/` (incluido `references/`) y falla si alguna skill instruye a lanzar a un primary (`build`, `plan`) con verbos de delegación/invocación/consulta. El patrón no incluye "cambiar a" a propósito: "propón al usuario cambiar a `plan`" es legal y no debe dispararse.

**Por qué:** el guardarraíl ya auditaba a los agentes pero no a las skills, y una skill podía volver a mandar "delega en `plan`" y fallar en runtime sin que ningún check lo detectara (pasó con `tdd` el 24-09).

**Verificación:** fixture con 2 casos rotos (`SKILL.md` con "delega en `plan`" y una `reference` con "delegar en `build`") → 2 violaciones nombrando archivo; 3 casos legales ("delega en `ui-ux`", "programar → `build`", "propón al usuario cambiar a `plan`") → 0 violaciones; repo real → exit 0. No consume presupuesto (vive en `scripts/`).

**Rollback:** `git revert` del commit.

<a id="sec-global-perms-2026-09-24"></a>
## 2026-09-24 — Permiso del harness: `external_directory` a `ask`

**Qué:** en `~/.config/opencode/opencode.jsonc` (global, **sin commit**), `permission.external_directory` pasa a `{"*": "ask"}` y se borran las 4 reglas `allow` que cubrían `~/.config/opencode/*` y `~/.local/share/opencode/*`. Pendiente para después de los humos: `"logLevel": "WARN"`, que elimina del log las líneas `INFO` con los comandos bash.

**Por qué:** con `allow`, un agente con `edit: allow` podía modificar el harness global sin preguntar. Se conserva `ask` (no `deny`) porque el propio `sync-global` necesita esa escritura. **Limitación conocida:** `ask` es un gate suave — el modo auto-approve lo convierte en `allow` automático. Para un gate duro habría que `deny` y abrir permisos puntuales.

**Verificación:** el JSONC sigue válido y arranca; el efecto solo se ve al reiniciar OpenCode (la config no es hot-reload). El backup del log se hizo antes de aplicar el prune.

**Rollback (literal):** restaurar en `permission.external_directory` las 4 reglas:

```jsonc
"external_directory": {
  "*": "ask",
  "~/.config/opencode/*": "allow",
  "~/.config\\opencode\\*": "allow",
  "~/.local/share/opencode/*": "allow",
  "~/.local\\share\\opencode\\*": "allow"
}
```

Y para revertir `logLevel`: borrar la línea `"logLevel": "WARN",`.

<a id="sec-failclosed-2026-09-23"></a>
## 2026-09-23 — Fail-closed real en frontmatter y sync

**Qué:** (1) `harness-budget.ps1` exige el `---` de cierre del frontmatter: sin él registra violación y se salta ese archivo (antes un `SKILL.md` sin cierre pasaba si encontraba `name:` y `description:` en el cuerpo). (2) `sync-global.ps1` hace `throw` cuando falta `scripts\harness-budget.ps1` (antes `Write-Warning` y sincronizaba a ciegas, contradiciendo el criterio de spec 001).

**Por qué:** revisión del lote de 12 commits (auditor + revisión propia) encontró dos *fail-open* reales: el frontmatter tolerante y el sync degradado. El primero permitía que una skill se midiera con metadatos que el loader no lee.

**Verificación:** fixture con `SKILL.md` sin cierre → exit 1 nombrando el archivo; copia del sync en un temporal sin `scripts/` → `throw` con exit 1; guardarraíl real verde (skills=34, AGENTS.md=60) y `sync-global.ps1` exit 0.

**Rollback:** revertir el commit (vuelve el parser tolerante y el sync con warning).

<a id="sec-comunicacion-2026-09-23"></a>
## 2026-09-23 — Skill `comunicacion-asertiva` (doctrina de redacción, densidad y diagramas)

**Qué:** nueva skill obligatoria en toda tarea (junto a `uso-eficiente`): núcleo de ~26 líneas (modo tarea con veredicto, **modo respuesta** para preguntas puras sin etiquetas, redacción sencilla, diagramas ASCII/tablas con 3+ elementos, **override** `modo detallado` / `modo resumen`, y regla de **precedencia**: si contradice a `AGENTS.md`, gana `AGENTS.md`) + `references/DOCTRINA.md` bajo demanda (escalera de densidad, plantillas, glosario de diagramas ASCII y el ejemplo malo vs bueno tomado de la auditoría real). `AGENTS.md` conserva los límites duros y añade el puntero + las dos reglas de fallback; `uso-eficiente` §4 pasa a puntero para dejar **fuente única**. Guardarraíl: +2 probes (respaldo del modo respuesta) y +3 checks fail-closed (puntero en `AGENTS.md`, límite duro "Maximo 5 bullets" solo en `AGENTS.md`, la skill declara la precedencia).

**Por qué:** las respuestas salían en 6+ párrafos sin veredicto ni densidad. La regla existía en `AGENTS.md` y en `uso-eficiente` (dos fuentes, sin doctrina); el usuario pidió una skill "siempre activa" — recordatorio estructural: lo único siempre inyectado es `AGENTS.md` + las `description`, por eso los límites duros se quedan en `AGENTS.md` y la doctrina vive en la skill.

**Verificación:** guardarraíl verde (skills=34); los 3 checks nuevos fallan en el fixture (exit 1) y el SSOT ya mordió en la primera pasada (el núcleo repetía el límite duro; se corrigió). Sin verificación automática del formato de salida: un assert con `opencode run` costaría ~12,5k tokens y el ruido no permite medirlo (ver spec 001).

**Rollback:** revertir los 3 commits. Coste: +45 tok fijos/sesión + ~310 tok por tarea; `DOCTRINA.md` solo se lee bajo demanda.

<a id="sec-triggers-2026-09-23"></a>
## 2026-09-23 — Gatillos de patrones + probes de trigger (versión ligera)

**Qué:** (1) `arquitectura` gana 3 keywords de disparo en su `description` (`pool de conexiones`, `proxy`, `reintentos`) y una sección de 3 líneas que apunta a `references/PATRONES.md`: tabla de 8 patrones con "dónde vive / cuándo sí / cuándo NO" (Factory, Builder, Specification, Strategy, Singleton, Prototype, Pool, Proxy), criterio de **módulo complejo** (2+ señales → el agente propone el patrón y espera OK; <2 señales o sin ganancia clara → no patrón) y 2 ejemplos (Pool en Python, Proxy en TypeScript). (2) La fila de `AGENTS.md` pasa a "| Capas, features, dominio, patrones (pool, proxy) |" (net-zero líneas). (3) `singleton` añadido a la description de `convenciones-frontend`: el probe lo destapó, no estaba en ningún gatillo pese a que el cuerpo de la skill lo mentiona. (4) `scripts/trigger-probes.json` (7 frases reales → skill esperada) validado por el guardarraíl en fail-closed: cada keyword debe existir en la `description` de la skill o en su fila de la tabla.

**Por qué:** 2 misses del gate observados en una sesión (review de UI y "auditar el harness" sin señal). El análisis de necesidad descartó el catálogo amplio: el modelo ya conoce los patrones y su valor es restraint, no capacidad; y su coste invisible era quemar el headroom de `description` (45) y `AGENTS.md` (60/60).

**Verificación:** guardarraíl verde (fail-closed: fixture sin `trigger-probes.json` → violación; probe con keyword inexistente → violación, el válido pasa); `+24 tokens/sesión` estimados (≈0,2%), por debajo del ruido de medición (±1-2k), por eso sin medición nueva. Smoke pendiente: reiniciar TUI y pedir "quiero un pool de conexiones reutilizable" → el gate debe declarar `arquitectura` y **proponer** el patrón.

**Rollback:** revertir los 3 commits. Disparador acordado para ampliar: 2-3 features backend con `timeout`/`retry`/`pool` ausentes en 2 semanas → reactivar el catálogo amplio con esa evidencia.

<a id="sec-remediacion-2026-09-22"></a>
## 2026-09-22 — Remediación de auditoría (4 MAJOR + recorte de tokens)

**Qué:** (1) `scripts/harness-budget.ps1` pasa a **fail-closed**: sin `name:`/`description:` en el frontmatter la skill no se mide ni se anuncia; `name` debe coincidir con la carpeta; el routing se valida **bidireccionalmente** (cada skill del repo con backticks en la tabla; cada token de la tabla existe como skill, agente o `customize-opencode`); los enlaces `reference/` y `references/` se comprueban (sin falsos positivos por ancla `#`). (2) `sync-global.ps1` cuenta skills recursivamente (`skills=33`, antes 32 por `informe-docx` anidada). (3) Allowlist de permisos en el global: `external_directory` = allow solo `~/.config/opencode` y `~/.local/share/opencode`, resto `ask`. (4) Routing UI: el agente `ui-ux` sigue la tabla, el detector corre **una pasada** con el launcher local (`.cmd detect <archivo>`, sin `npx`) y el veredicto de review lo da `frontend-design-review` (anti-doble-review); wrapper `impecable` y `references/CLI.md` sin `npx`; `impecable` pasa a obligatoria en la fila de cambio UI visible. (5) Tabla: `auditor` sale de la columna de skills, fila 25 compactada ("carga solo la que aplique"), fila nueva "Auditoría del harness → `customize-opencode`", `build` delega refactor/deuda/performance en `quality`. (6) Tokens: 10 `description` recortadas (6 outliers ≥40 → ≤30; 3 manuales → ≤15) y `uso-eficiente` 65 → 39 líneas.

**Por qué:** la auditoría del 2026-09-22 encontró 4 MAJOR (validador que pasaba en abierto con frontmatter ausente, routing que mezclaba agentes con skills, contradicción tabla↔agente↔wrapper en el flujo Impeccable, `external_directory: allow *`) y ~33% de cada sesión en overhead de metadata del harness. El guardarraíl se endureció primero para que los cambios de routing siguientes fueran verificables.

**Verificación:** guardarraíl en verde (`AGENTS.md=60`, agentes=301, skills=33); fixture con 3 violaciones (frontmatter sin `name:`, `name`≠carpeta, token inexistente en la tabla) → exit 1; `sync-global.ps1` exit 0; A/B con smoke v2 (mediana n=3, mismo día): **13.042 → 12.477 = −565 tokens/sesión (−4,3%)**; `opencode.jsonc` validado como JSON. Medición global-only v2 no completada (corrida abortada).

**Rollback:** revertir los commits; para el global, restaurar `external_directory: {"*": "allow"}` en `~/.config/opencode/opencode.jsonc`. Requiere reiniciar OpenCode (la config no es hot-reload).

<a id="sec-fdr"></a>
## 2026-09-21b — Skill de review UI adoptada (`frontend-design-review`)

**Qué:** vendorizada y adaptada la skill `frontend-design-review` de `microsoft/skills` (MIT): review estructurado de UI con 3 pilares (frictionless, quality craft, trustworthy), compliance de design system, scoring y formato de salida en `references/`.

**Por qué:** era la única candidata del catálogo `VoltAgent/awesome-agent-skills` con un eje que el harness no cubría. Descartadas: `anthropics/frontend-design` (redundante con `impeccable`), `openai/frontend-skill` (no existe en `openai/skills@main`), `google-labs-code/design-md` (redundante y requiere Stitch MCP).

**Adaptaciones locales:** `description` a 26 palabras (presupuesto ≤45); WCAG **2.2 AA** canónico en lugar de 2.1 (así el guardarraíl sigue en verde); se **eliminó el bloque de creación creativa** (duplicaba `impeccable`) y quedó como review puro (`SKILL.md` 116 líneas); regla **anti-doble-review** (esta skill da el formato/veredicto; `impeccable` ejecuta `shape`/`critique`/`audit`/`detect`); Figma/Storybook opcionales.

**Archivos:** `.opencode/skills/frontend-design-review/{SKILL.md,references/*.md}` (nuevos) · `scripts/harness-budget.ps1` (exención vendor) · `AGENTS.md` (ruteo en la fila de cambio visible) · `.opencode/skills/ui-ux/SKILL.md` (puntero) · `docs/specs/002-adopcion-frontend-design-review.md`.

**Verificación:** `harness-budget.ps1` en verde y `sync-global.ps1` exit 0 (tras reiniciar, la skill queda disponible en el global).

**Rollback:** borrar la carpeta `frontend-design-review`, revertir el commit, quitar la exención del guardarraíl y la mención en `AGENTS.md`.

**Riesgos:** solape con `impeccable` (mitigado por la regla anti-doble-review); divergencia con upstream (mantenimiento manual); +1 `description` fija por sesión (~31 palabras).

<a id="sec-ui-routing"></a>
## 2026-09-21 — Routing UI sin doble activación (A+D) y medición

**Qué:** (D) la tabla del Skill Gate separa UI de código vs cambio visible: fila "UI: codigo, componentes, estilos (sin cambio visible)" → `convenciones-frontend`; fila "Cambio UI visible o interactivo" → `ui-ux`, con `convenciones-frontend`, `accesibilidad` e `impecable`+`impeccable` como opcionales. (A) punteros cruzados de una línea entre `convenciones-frontend` y `ui-ux`, y `description` de `convenciones-frontend` orientada a código ("para cambios visibles usa ui-ux").

**Por qué:** antes las dos filas disparaban juntas en todo cambio visible (doble activación). La hipótesis era ahorro de tokens; la medición la descartó.

**Medición** (smoke de tarea UI con `opencode run --format json`, mediana n=3): **13.211 → 13.178 = −33 (−0,25%)**, dentro del ruido. Conclusión: no se justifica fusionar `convenciones-frontend` + `ui-ux` ni fragmentar la cadena; el coste dominante no está en esas skills. El cambio queda por claridad de routing, no por ahorro.

**Archivos:** `AGENTS.md` (2 filas), `.opencode/skills/convenciones-frontend/SKILL.md`, `.opencode/skills/ui-ux/SKILL.md`.

**Verificación:** `scripts/harness-budget.ps1` en verde (AGENTS.md=59, agentes=303, skills=32); `sync-global.ps1` exit 0.

**Rollback:** revertir el commit correspondiente (no hay cambios fuera del repo).

<a id="sec-0"></a>
## 2026-09-19b — Notificaciones de escritorio vía plugin (Windows Terminal)

**Qué:** plugin global que emite toasts nativos de Windows en dos eventos: sesión principal completada (`session.idle`) y pedido de permiso (`permission.asked` de la API v2 / `permission.updated` de la v1).

**Por qué:** OpenCode delega la notificación al terminal emitiendo **OSC 777** (detecta `WT_SESSION`). Windows Terminal 1.24 (única versión instalada, sin Preview) ignora esa secuencia: el soporte existe solo en `main` de microsoft/terminal (PR #20012, merged 2026-06-04, issue #7718), no llegó a ningún release y cuando salga exigirá `compatibility.allowOSC777: true` (default `false`). Los sonidos sí funcionan porque se reproducen localmente (miniaudio vía `opentui.dll`). Descartados foco (WT soporta DECSET 1004) y config (`notifications: true` ya estaba activo).

**Archivo** (global, no versionado; no lo toca `sync-global.ps1`):

`C:\Users\damez\.config\opencode\plugins\notify-windows.js`

<details><summary><b>Código del plugin (copiar para restaurar)</b></summary>

```js
/**
 * Notificaciones de escritorio nativas de Windows para OpenCode.
 *
 * Por que existe: OpenCode delega las notificaciones al terminal (OSC 777).
 * Windows Terminal 1.24 no soporta esa secuencia (el soporte esta en main,
 * PR microsoft/terminal#20012, y cuando salga exigira
 * compatibility.allowOSC777=true), asi que el toast nativo nunca aparece.
 * Este plugin emite el toast por WinRT y solo cuando el terminal que hospeda
 * la sesion no esta en primer plano.
 *
 * Eventos cubiertos: fin de sesion principal (session.idle) y pedidos de
 * permiso (permission.asked de la API v2 / permission.updated de la v1).
 */

import { spawn } from "node:child_process";

// AppID de PowerShell: permite mostrar el toast sin instalar ni registrar nada.
const APP_ID =
  "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe";

const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class FgWin {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
'@
$handle = [FgWin]::GetForegroundWindow()
$fgPid = 0
[void][FgWin]::GetWindowThreadProcessId($handle, [ref]$fgPid)
$fg = (Get-Process -Id $fgPid -ErrorAction SilentlyContinue).ProcessName
if ($fg -and $env:OC_TERM_PROC -and $fg -match $env:OC_TERM_PROC) { exit 0 }
try {
  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime] | Out-Null
  $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
  $texts = $template.GetElementsByTagName('text')
  $null = $texts.Item(0).AppendChild($template.CreateTextNode($env:OC_NOTIFY_TITLE))
  $null = $texts.Item(1).AppendChild($template.CreateTextNode($env:OC_NOTIFY_BODY))
  $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($env:OC_APP_ID).Show($toast)
} catch {
  exit 1
}
`;

// Proceso del terminal que hospeda esta sesion: si esta en primer plano, no molestar.
const TERM_PATTERN = (() => {
  const names = [];
  if (process.env.WT_SESSION) names.push("WindowsTerminal");
  if (process.env.WEZTERM_EXECUTABLE) names.push("wezterm-gui");
  if (process.env.ALACRITTY_WINDOW_ID) names.push("alacritty");
  if (process.env.GHOSTTY_RESOURCES_DIR) names.push("ghostty");
  if (process.env.TERM_PROGRAM === "vscode") names.push("Code");
  if (process.env.OPENCODE_APP) names.push("OpenCode");
  return names.join("|");
})();

function notify(title, body) {
  try {
    const encoded = Buffer.from(PS_SCRIPT, "utf16le").toString("base64");
    // Spawn directo, sin detached: detached + stdio:ignore no arranca el hijo en Bun.
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-EncodedCommand", encoded],
      {
        windowsHide: true,
        stdio: ["ignore", "ignore", "pipe"],
        env: {
          ...process.env,
          OC_NOTIFY_TITLE: title,
          OC_NOTIFY_BODY: body,
          OC_APP_ID: APP_ID,
          OC_TERM_PROC: TERM_PATTERN,
        },
      },
    );
    let stderr = "";
    child.stderr?.on("data", (data) => {
      stderr += String(data);
    });
    child.on("error", () => {});
    child.on("exit", (code) => {
      if (code !== 0) console.log("[notify-windows] fallo al notificar:", code, stderr.slice(0, 300));
    });
  } catch {
    // Una notificacion nunca debe romper la sesion.
  }
}

export const WindowsNotifyPlugin = async () => {
  console.log("[notify-windows] plugin cargado");

  // sessionID -> parentID: permite ignorar el done de sesiones hijas (subagentes).
  const parents = new Map();

  return {
    event: async ({ event }) => {
      const props = event?.properties ?? {};

      if (event?.type === "session.created" || event?.type === "session.updated") {
        if (props.sessionID) parents.set(props.sessionID, props.info?.parentID);
        return;
      }

      if (event?.type === "session.deleted") {
        parents.delete(props.sessionID);
        return;
      }

      if (event?.type === "session.idle") {
        if (parents.get(props.sessionID)) return; // subagente: el done del principal llega aparte
        notify("OpenCode", "Sesion completada");
        return;
      }

      if (event?.type === "permission.asked" || event?.type === "permission.updated") {
        const kind = props.permission ?? props.type ?? "una herramienta";
        notify("OpenCode", `Pide permiso para: ${kind}`);
      }
    },
  };
};
```

</details>

**Comportamiento**
- Solo notifica si el terminal que hospeda la sesión no está en primer plano (detecta el proceso por env: `WT_SESSION` → `WindowsTerminal`, más WezTerm/Alacritty/Ghostty/VS Code/app OpenCode).
- Ignora el `session.idle` de sesiones hijas (subagentes) con el `parentID` cacheado de `session.created`/`session.updated`.
- Toast WinRT vía PowerShell con AppID de PowerShell (sin instalar módulos); se lanza detached, no bloquea la sesión.
- No reemplaza los sonidos de la entrada anterior: los complementa.

**Verificación** (realizada)

| Prueba | Resultado |
| --- | --- |
| Toast WinRT desde PowerShell | Aparece (confirmado por el usuario) |
| Guarda de foco con `foreground=WindowsTerminal` | `guardMatch=True` (no molesta con el terminal en foco) |
| Carga en sesión real (`opencode run`) | `[notify-windows] plugin cargado` |
| E2E en servidor persistente (`serve` + `run --attach`) | `start` → `shown: Sesion completada`, exit 0 |

Dos trampas encontradas en las pruebas (y su efecto en el código final):
- `spawn` con `detached: true` + `stdio: "ignore"` **no arrancaba el hijo** en el runtime Bun (sin error ni log); con spawn directo funciona.
- `opencode run` headless: el proceso termina al acabar el turno y mata el árbol de procesos, así que el toast no alcanza a mostrarse; no aplica a la TUI (servidor vivo). Tampoco hay sonidos en `run` (son de la TUI).

**Resultado (2026-09-19, tras reiniciar la TUI):** con el terminal fuera de foco, un prompt de permiso real disparó sonido `permission` + toast "Pide permiso para: bash" (confirmado por el usuario). El intento anterior no era prueba válida: el plugin aún no estaba cargado (sin reinicio) y el prompt salió con la terminal en primer plano. La ruta `done` (`session.idle`) quedó verificada en el E2E de `serve` + `run --attach`; en la TUI solo falta confirmarla saliendo a mitad de un turno.

**Rollback:** borrar `notify-windows.js`; reiniciar OpenCode.

**Riesgos y límites**
- El `console.log` de init aparece en la salida de `opencode run` (igual que el ejemplo oficial); es invisible en la TUI.
- Si el terminal pasa a soportar OSC 777 (WT 1.26 con el flag, WezTerm), el plugin duplicaría la notificación nativa: retirarlo o desactivar `attention.notifications`.
- Requiere PowerShell 5.1 + WinRT (Windows 10/11 de escritorio); `opencode serve` puro no inicializa el plugin hasta que hay sesión.
- En modo headless (`opencode run`) el toast puede no alcanzar a verse porque el proceso sale antes; los sonidos de atención tampoco existen ahí.

**Evidencia:** `~/.config/opencode/plugins/notify-windows.js` · `@opencode-ai/plugin/dist/index.d.ts:225` (hook `permission.ask`) · SDK v2 `types.gen.d.ts:1128,1225` (`permission.asked`, `session.idle`) · PR microsoft/terminal#20012 / issue #7718 · binario 1.18.31 (OSC 777 + detección `WT_SESSION`).

<a id="sec-1"></a>
## 2026-09-19 — Sonidos de atención en la TUI

**Qué:** habilitar los sonidos nativos de OpenCode para `done`, `permission`, `question`, `error` y `subagent_done`, más notificaciones de escritorio cuando la terminal está en segundo plano.

**Por qué:** pedido del usuario (sonido al terminar una tarea y al pedir un permiso). Se descartó el truco de escribir `\a` en `AGENTS.md`: la TUI renderiza markdown y los caracteres de control no llegan al terminal; el mecanismo soportado es `attention` (desactivado por defecto).

**Config aplicada** (archivo global, no versionado en el repo; no lo toca `sync-global.ps1`, que solo copia skills/agents/commands):

`C:\Users\damez\.config\opencode\tui.json`
```json
{
  "$schema": "https://opencode.ai/tui.json",
  "attention": {
    "enabled": true,
    "notifications": true,
    "sound": true,
    "volume": 0.5,
    "sound_pack": "opencode.default"
  }
}
```

**Cómo funciona**
- Pack builtin `opencode.default`: mp3 embebidos en el binario y reproducidos in-process (miniaudio vía `opentui.dll`; backends WASAPI/DirectSound/WinMM). No usa reproductores externos.
- `notifications: true` muestra el banner del sistema solo cuando la terminal está blurred; el sonido suena siempre que el evento dispare.
- Aplica solo a la TUI: `opencode run` no reproduce sonidos.

**Verificación** (tras reiniciar OpenCode; la config TUI se lee al arrancar)

| Prueba | Cómo | Esperado |
| --- | --- | --- |
| Permiso | pedir un comando bash no allowlisteado (`"bash": {"*": "ask"}`) | suena `permission` |
| Fin de turno | completar cualquier respuesta | suena `done` |
| Notificación | mandar la terminal a segundo plano antes del evento | banner del sistema |

**Resultado (2026-09-19):** los sonidos funcionan; el banner nunca aparece. Causa raíz y solución en la entrada siguiente.

**Rollback:** borrar `tui.json` o poner `attention.enabled: false`; reiniciar la TUI.

**Riesgos y límites**
- Si `opentui.dll` no carga, la TUI queda en silencio y loguea `failed to create tui audio`; cambiar a `.wav` no ayuda (mismo engine).
- No hay mute por evento en `tui.json`: `question` y `error` también suenan.
- `volume: 0.5` es punto de partida (default del schema: 0.4); se ajusta en una línea.

**Evidencia:** `~/.config/opencode/node_modules/@opencode-ai/plugin/dist/tui.d.ts:170-216,323-333` · docs `https://opencode.ai/docs/tui/` (sección Attention) y `https://opencode.ai/docs/config/` (tui.json global) · binario 1.18.31 (`opencode-ai/package.json:9`).
