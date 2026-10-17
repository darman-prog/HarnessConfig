# Stitch MCP global (deshabilitado por defecto)

> **Para qué:** usar Google Stitch (diseño de UI con IA) desde OpenCode en cualquier proyecto, vía su MCP remoto, solo cuando lo actives.
> **Cuándo leerlo:** cuando el usuario pide activar Stitch o toca montar la API key por primera vez.

Stitch queda declarado en la config global pero **deshabilitado**: sin perfil de sesión no conecta, no carga tools y no consume contexto. La skill [activacion-mcp](../../.opencode/skills/activacion-mcp/SKILL.md) resume la activación; aquí vive el detalle.

## Requisitos

- OpenCode **≥ 1.14.46**: versiones anteriores cierran con `Failed to get tools` (los `outputSchema` con `$defs` de Stitch no se resolvían; fix PR #26614). Verifica con `opencode --version`.
- Bloque `mcp.stitch` en `~/.config/opencode/opencode.jsonc` con `enabled:false` (remote `https://stitch.googleapis.com/mcp`, `oauth:false`, timeout 120000 ms, header `X-Goog-Api-Key: {env:STITCH_API_KEY}`). Ese archivo está fuera del repo y no lo toca `sync-global.ps1`.
- Perfil de activación `~/.config/opencode/opencode.stitch.json` (solo `mcp.stitch.enabled:true`). Se recrea con el snippet de abajo si se pierde.
- API key de Stitch: Stitch → foto de perfil → **Stitch settings** → **API key** → **Create key**. Copiala al crearla.

## Montaje paso a paso (PowerShell)

**1. Key permanente** (una sola vez; queda en el entorno del usuario):

```powershell
$key = Read-Host "Pega tu Stitch API key"
[Environment]::SetEnvironmentVariable("STITCH_API_KEY", $key, "User")
# cierra esta ventana y abre una PowerShell NUEVA
```

**2. Activar Stitch solo en la sesión que quieras:**

```powershell
$env:OPENCODE_CONFIG = "$env:USERPROFILE\.config\opencode\opencode.stitch.json"
opencode
```

Sin esa variable, `opencode` arranca con Stitch deshabilitado. Para desactivarlo, cierra esa terminal o abre otra sin la variable.

**Perfil de activación** (`~/.config/opencode/opencode.stitch.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": { "stitch": { "enabled": true } }
}
```

La clave vive **solo** en `STITCH_API_KEY`: nunca en `opencode.jsonc`, en el perfil de activación, en `.env` del repo ni pegada en el chat. Si se filtra, regenerala en Stitch settings.

## Verificar (smoke)

```powershell
opencode mcp list                        # sin perfil: stitch deshabilitado
$env:OPENCODE_CONFIG = "$env:USERPROFILE\.config\opencode\opencode.stitch.json"
opencode mcp list                        # con perfil: stitch conectado
opencode run "List my Stitch projects"   # lista de proyectos o vacía; nunca "Failed to get tools"
```

Tools del servidor: `list_projects`, `create_project`, `list_screens`, `generate_screen_from_text`, `edit_screens`, `list_design_systems` (el prefijo local puede variar; confírmalo con `opencode mcp list`). La skill entra con frases como "usa el MCP de Stitch"; si no está activo, el agente te pide relanzar con el perfil.

## Troubleshooting

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| Aparece `disabled` cuando lo quieres usar | Falta `OPENCODE_CONFIG` en esa terminal | Relanzar con el perfil de activación |
| `Failed to get tools` | OpenCode < 1.14.46 o schema `$defs` | Actualizar OpenCode y repetir; si persiste, reportar y **no** instalar el proxy de terceros sin aprobación |
| 401/403 | Key inválida o expirada | Regenerar en Stitch settings |
| Header vacío | `STITCH_API_KEY` no estaba en el entorno de la sesión | Usar la key permanente y abrir una terminal nueva |
| Sin conexión | Red/proxy bloquea | Verificar salida a `stitch.googleapis.com` y `storage.googleapis.com` (descargas de HTML/capturas) |

## Límites

- Stitch es fuente de diseño, no fuente de verdad: **git manda**. Los HTML/capturas que descargue el agente van a `.stitch/designs/` y no se commitean sin pedido explícito.
- Playwright y Notion siguen opt-in por proyecto (`opencode.qa.json`, `opencode.notion.json`); Stitch es la única excepción global y está deshabilitada por defecto.
- Si necesitas Playwright **y** Stitch en la misma sesión, hace falta un perfil combinado; hoy no está incluido.
- La config global y el perfil de activación no se versionan: si se pierden, se recrean con los snippets de este doc.
- Las generaciones lentas son normales (minutos); `timeout: 120000` cubre la carga de tools, no cada generación: si una llamada larga vence, reintenta con el mismo prompt.
