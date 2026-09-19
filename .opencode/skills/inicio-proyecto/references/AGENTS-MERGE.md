# AGENTS-MERGE y comando de copia

## Comando de copia (Windows)

Ejecuta estos comandos en el directorio del proyecto destino. La ruta del template es fija para tu maquina.

```powershell
# 1. Copiar .opencode/ completo (excluyendo node_modules)
robocopy "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\.opencode" ".opencode" /E /XD node_modules /COPY:DAT /R:2 /W:1

# 2. Copiar opencode.json del template
Copy-Item "C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\.opencode\opencode.json" ".opencode\opencode.json" -Force
```

> Nota: `robocopy` devuelve codigos de salida 0-7 como exito. Codigo >= 8 es error real. Si falla, revisa permisos de escritura en el destino.

## Logica de merge para AGENTS.md

Si el proyecto destino **ya tiene AGENTS.md**:

1. Lee el archivo existente.
2. Identifica secciones por encabezado `## `.
3. Actualiza SOLO estas secciones con lo descubierto en las preguntas:
   - `## Stack` → lenguaje, frameworks, gestor de paquetes detectado.
   - `## Comandos` → comandos clave del stack (dev server, test, build, lint).
4. **Preserva sin tocar**:
   - `## Arranque de tarea — Skill Gate` (viene del template).
   - `## Estilo de respuesta` (viene del template).
   - `## Definition of Done` (viene del template).
   - `## Skills disponibles` (viene del template, lista completa de 24 skills).
   - `## Agentes` (viene del template).
   - `## Manejo de .gitignore` (si existe).
   - Cualquier seccion custom que el proyecto ya tenga (ej. `## Arquitectura del proyecto`).
5. Reemplaza las secciones actualizadas en su posicion original, manteniendo el orden del archivo existente.
6. Si una seccion objetivo no existe, agregala en logica posicion (despues de Stack, antes de Definition of Done).

Si el proyecto destino **NO tiene AGENTS.md**:

1. Copia el AGENTS.md del template (`C:\Users\damez\Downloads\Estudio\PlantillaOpenCode\AGENTS.md`).
2. Actualiza solo Stack y Comandos con lo descubierto.
3. El resto queda igual (Skill Gate, estilo, DoD, skills, agentes vienen del template).

## Despues de copiar

Verifica:

- [ ] `.opencode/` existe con skills y agents.
- [ ] `.opencode/opencode.json` existe.
- [ ] `AGENTS.md` existe en raiz con Stack/Comandos actualizados.
- [ ] `PRODUCT.md` y `DESIGN.md` generados en raiz.
- [ ] `docs/project-brain/INDEX.md` creado (template de skill `contexto-proyecto`) + documentos sembrados con metadata `confidence`.
- [ ] NO existe `.opencode/node_modules` (excluido).
- [ ] NO se copio `.git` del template.

## Lo que NO hace esta skill

- No corre `/init` (el merge de AGENTS.md lo reemplaza).
- No modifica el codigo del proyecto destino.
- No instala dependencias.
- No hace commit de los archivos copiados.
