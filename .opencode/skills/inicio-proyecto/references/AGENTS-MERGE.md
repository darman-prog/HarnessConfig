# AGENTS-MERGE y comandos de copia

## Contexto

Las skills y agentes del harness son **globales** (`~/.config/opencode/`, sincronizados
con `sync-global.ps1` de la plantilla). El onboarding NO copia skills ni agentes al
proyecto: solo config de proyecto, `OPENCODE.md` + `AGENTS.md` y documentacion.

## Comandos (Windows)

```powershell
# 1. Config de proyecto (permisos, compaction, instructions)
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\.opencode\opencode.json" ".opencode\opencode.json" -Force
# (crear carpeta .opencode si no existe: New-Item -ItemType Directory -Force -Path .opencode)

# 2. Perfiles MCP opt-in (SOLO si el usuario los pide)
# QA / Playwright:
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\.opencode\opencode.qa.json" ".opencode\opencode.qa.json" -Force
# Notion:
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\.opencode\opencode.notion.json" ".opencode\opencode.notion.json" -Force
# Stitch es global (~/.config/opencode/opencode.jsonc): NO se copia al proyecto.

# 3. `OPENCODE.md` + `AGENTS.md` si el proyecto no los tiene
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\OPENCODE.md" ".\OPENCODE.md" -Force
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\AGENTS.md" ".\AGENTS.md" -Force
```

Si el proyecto necesita skills/agentes propios o el usuario fuerza copia local, usa
`.\sync-global.ps1` (referencia) y explicale que lo normal es global.

## Logica de merge para OPENCODE.md + AGENTS.md

Si el proyecto destino **ya tiene uno de los dos**:

1. Lee el archivo existente.
2. Identifica secciones por encabezado `## `.
3. Actualiza SOLO estas secciones del agnóstico con lo descubierto en las preguntas:
   - `## Stack` → lenguaje, frameworks, gestor de paquetes detectado.
   - `## Comandos` → comandos clave del stack (dev server, test, build, lint).
   - `OPENCODE.md` no se edita: Skill Gate, estilo, DoD, tokens y roster vienen del template.
4. **Preserva sin tocar**:
   - Todo `OPENCODE.md` (salvo excepcion documentada pedida por el usuario).
   - En `AGENTS.md`: `## Contexto y convivencia`, `## Manejo de .gitignore` y cualquier seccion custom que el proyecto ya tenga.
5. Reemplaza las secciones actualizadas en su posicion original.
6. Si una seccion objetivo no existe, agregala en posicion logica.
7. **Presupuesto**: `AGENTS.md` agnóstico debe quedar **≤35 lineas**; `OPENCODE.md` se copia tal cual (tope 75). No agregues listas de skills: viven en las skills.

Si el proyecto destino **NO tiene ninguno de los dos**:

1. Copia `OPENCODE.md` y `AGENTS.md` del template.
2. Actualiza solo Stack y Comandos del agnóstico con lo descubierto.
3. El resto queda igual (Skill Gate, estilo, DoD, tokens y roster vienen de `OPENCODE.md`; contexto y gitignore de `AGENTS.md`).

## Despues de copiar

Verifica:

- [ ] `.opencode/opencode.json` existe.
- [ ] Perfiles MCP solo si el usuario los pidio (`opencode.qa.json` / `opencode.notion.json`); Stitch es global y no se copia.
- [ ] `OPENCODE.md` existe en raiz (copia del template, sin editar).
- [ ] `AGENTS.md` agnóstico existe en raiz con Stack/Comandos actualizados y **≤35 lineas**.
- [ ] `PRODUCT.md` y `DESIGN.md` generados en raiz.
- [ ] `docs/project-brain/INDEX.md` creado (template de skill `contexto-proyecto`) + documentos sembrados con metadata `confidence`.
- [ ] NO existe `.opencode/node_modules` ni `.git` copiado.
- [ ] NO se copiaron skills/agentes al proyecto (son globales).
- [ ] Si el destino no tenia skills globales, informa: ejecutar `sync-global.ps1` desde la plantilla y reiniciar OpenCode.

## Lo que NO hace esta skill

- No corre `/init` (el merge de `OPENCODE.md`+`AGENTS.md` lo reemplaza).
- No modifica el codigo del proyecto destino.
- No instala dependencias.
- No hace commit de los archivos copiados.
