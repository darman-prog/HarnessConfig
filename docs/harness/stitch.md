# Perfil opt-in de Stitch MCP

> **Para qué:** usar Google Stitch (diseño de UI con IA) desde OpenCode vía su MCP remoto.
> **Cuándo leerlo:** cuando el usuario menciona Stitch, pide activar su MCP o toca montar la API key por primera vez.

La skill [activacion-mcp](../../.opencode/skills/activacion-mcp/SKILL.md) resume la activación; aquí vive el detalle: requisitos, montaje, smoke y troubleshooting.

## Requisitos

- OpenCode **≥ 1.14.46**: versiones anteriores cierran con `Failed to get tools` (los `outputSchema` con `$defs` de Stitch no se resolvían; fix PR #26614). Verifica con `opencode --version`.
- Perfil del proyecto: `.opencode/opencode.stitch.json` (remote `https://stitch.googleapis.com/mcp`, `oauth:false`, timeout 120000 ms).
- API key de Stitch: Stitch → foto de perfil → **Stitch settings** → **API key** → **Create key**. Copiala al crearla.

## Montaje paso a paso (PowerShell)

Opción temporal (la clave vive solo en esa terminal):

```powershell
cd <raiz-del-proyecto>                                   # donde está .opencode/
$env:STITCH_API_KEY = Read-Host "Pega tu Stitch API key" # no queda en el historial
$env:OPENCODE_CONFIG = (Resolve-Path ".opencode/opencode.stitch.json").Path
opencode
```

Opción permanente (clave en el entorno del usuario de Windows; cómoda si la máquina es personal):

```powershell
$key = Read-Host "Pega tu Stitch API key"
[Environment]::SetEnvironmentVariable("STITCH_API_KEY", $key, "User")
# cierra y reabre PowerShell; después solo hace falta $env:OPENCODE_CONFIG
```

La clave vive **solo** en `STITCH_API_KEY`: nunca en `opencode.stitch.json` (solo lleva `{env:STITCH_API_KEY}`), en `.env` del repo ni pegada en el chat. Si se filtra, regenera la key y repite el montaje.

## Verificar (smoke)

```powershell
opencode mcp list                        # lista `stitch` con sus tools
opencode run "List my Stitch projects"   # lista de proyectos o vacía; nunca "Failed to get tools"
```

Tools del servidor: `list_projects`, `create_project`, `list_screens`, `generate_screen_from_text`, `edit_screens`, `list_design_systems` (el prefijo local puede variar; confírmalo con `opencode mcp list`). La skill entra con frases como "usa el MCP de Stitch".

## Troubleshooting

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| `Failed to get tools` | OpenCode < 1.14.46 o schema `$defs` | Actualizar OpenCode y repetir; si persiste, reportar y **no** instalar el proxy de terceros sin aprobación |
| 401/403 | Key inválida o expirada | Regenerar en Stitch settings |
| Header vacío | `STITCH_API_KEY` no estaba en la terminal que lanzó OpenCode | Repetir la export o usar la opción permanente |
| Sin conexión | Red/proxy bloquea | Verificar salida a `stitch.googleapis.com` y `storage.googleapis.com` (descargas de HTML/capturas) |

## Límites

- Stitch es fuente de diseño, no fuente de verdad: **git manda**. Los HTML/capturas que descargue el agente van a `.stitch/designs/` y no se commitean sin pedido explícito.
- Ningún MCP es global: `sync-global.ps1` no copia este perfil; un proyecto nuevo lo recibe en el onboarding (`inicio-proyecto`).
- Las generaciones lentas son normales (minutos); `timeout: 120000` cubre la carga de tools, no cada generación: si una llamada larga vence, reintenta con el mismo prompt.
