# Bajar a OpenCode V1.19.3 (V2 rompe los plugins)

> Para qué: dejar el harness en `opencode-ai@1.19.3` cuando la V2 dejó de cargar `notify-windows.js` y `rtk.ts`. El porqué está en [ADR-002](../adr/002-Version1-opencode.md).

## Antes de empezar
- Cierra todas las ventanas de OpenCode.
- Guarda la config: el paso 2 hace una copia de `~/.config/opencode` y `~/.local/share/opencode` (plugins, tema, `opencode.jsonc`, `tui.json` y la base de datos).

## Pasos (PowerShell)

1. **Cerrar OpenCode por completo**
   ```powershell
   opencode service stop
   Get-Process opencode -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Copia de seguridad** (plugins, config y sesiones)
   ```powershell
   $stamp = Get-Date -Format "yyyyMMdd-HHmm"
   Copy-Item "$env:USERPROFILE\.config\opencode" "$env:USERPROFILE\.config\opencode.backup-$stamp" -Recurse -Force
   Copy-Item "$env:USERPROFILE\.local\share\opencode" "$env:USERPROFILE\.local\share\opencode.backup-$stamp" -Recurse -Force
   ```

3. **Quitar V2 e instalar V1**
   ```powershell
   npm uninstall -g @opencode/cli
   npm install -g opencode-ai@1.19.3
   ```

4. **Limpiar restos y verificar**
   ```powershell
   Remove-Item "$env:APPDATA\npm\node_modules\.opencode-ai-*" -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item "$env:APPDATA\npm\opencode2*" -Force -ErrorAction SilentlyContinue
   opencode --version
   npm ls -g --depth=0
   ```
   Debe decir `1.19.3` y listar `opencode-ai@1.19.3`, sin `@opencode/cli`.

5. **Abrir de nuevo**
   ```powershell
   opencode
   ```

## Comprobación
Los plugins vuelven a cargar porque V1 lee `~/.config/opencode/plugins/`. En el log de arranque debe aparecer `[notify-windows] plugin cargado` (dos veces: el plugin se registra dos veces, ver el riesgo aceptado en `docs/harness/estado-actual.md`).

## Si falla
- `opencode --version` no es 1.19.3 → queda V2 instalado: repite el paso 3.
- Los plugins no cargan → revisa que la copia de seguridad del paso 2 esté intacta y que `~/.config/opencode/plugins/` tenga los dos ficheros.
