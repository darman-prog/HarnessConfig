# AGENTS-MERGE y comandos de copia

## Contexto

Las skills y agentes del harness son **globales** (`~/.config/opencode/`, sincronizados
con `sync-global.ps1` de la plantilla). El onboarding NO copia skills ni agentes al
proyecto: solo config de proyecto, `AGENTS.md` y documentacion.

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

# 3. AGENTS.md si el proyecto no tiene uno
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\AGENTS.md" ".\AGENTS.md" -Force
```

Si el proyecto necesita skills/agentes propios o el usuario fuerza copia local, usa
`.\sync-global.ps1` (referencia) y explicale que lo normal es global.

## Logica de merge para AGENTS.md

Si el proyecto destino **ya tiene AGENTS.md**:

1. Lee el archivo existente.
2. Identifica secciones por encabezado `## `.
3. Actualiza SOLO estas secciones con lo descubierto en las preguntas:
   - `## Stack` → lenguaje, frameworks, gestor de paquetes detectado.
   - `## Comandos` → comandos clave del stack (dev server, test, build, lint).
4. **Preserva sin tocar**:
   - `## Skill Gate (obligatorio antes de leer, buscar o editar)` (viene del template).
   - `## Estilo de respuesta` (viene del template).
   - `## Definition of Done` (puntero a la skill `workflow`).
   - `## Tokens y contexto` (puntero a `uso-eficiente`).
   - `## Manejo de .gitignore` (viene del template).
   - `## Agentes` (viene del template).
   - Cualquier seccion custom que el proyecto ya tenga.
5. Reemplaza las secciones actualizadas en su posicion original.
6. Si una seccion objetivo no existe, agregala en posicion logica.
7. **Presupuesto**: el `AGENTS.md` resultante debe quedar **≤60 lineas**. No agregues listas
   de skills ni copies politicas: viven en las skills (`workflow`, `uso-eficiente`).

Si el proyecto destino **NO tiene AGENTS.md**:

1. Copia el AGENTS.md del template.
2. Actualiza solo Stack y Comandos con lo descubierto.
3. El resto queda igual (Skill Gate, estilo, DoD, tokens, gitignore y agentes vienen del template).

## Despues de copiar

Verifica:

- [ ] `.opencode/opencode.json` existe.
- [ ] Perfiles MCP solo si el usuario los pidio (`opencode.qa.json` / `opencode.notion.json`).
- [ ] `AGENTS.md` existe en raiz con Stack/Comandos actualizados y **≤60 lineas**.
- [ ] `PRODUCT.md` y `DESIGN.md` generados en raiz.
- [ ] `docs/project-brain/INDEX.md` creado (template de skill `contexto-proyecto`) + documentos sembrados con metadata `confidence`.
- [ ] NO existe `.opencode/node_modules` ni `.git` copiado.
- [ ] NO se copiaron skills/agentes al proyecto (son globales).
- [ ] Si el destino no tenia skills globales, informa: ejecutar `sync-global.ps1` desde la plantilla y reiniciar OpenCode.

## Lo que NO hace esta skill

- No corre `/init` (el merge de AGENTS.md lo reemplaza).
- No modifica el codigo del proyecto destino.
- No instala dependencias.
- No hace commit de los archivos copiados.
