# sync-global.ps1 — sincroniza la plantilla (repo-fuente) hacia el harness global de OpenCode
# Uso: powershell -File .\sync-global.ps1
# Sobrescribe skills/agentes/commands del global con la version de esta plantilla.
# NO sincroniza configs de proyecto (opencode.json, perfiles qa/notion) ni MCP.

$ErrorActionPreference = "Stop"
$src = Join-Path $PSScriptRoot ".opencode"
$dst = Join-Path $env:USERPROFILE ".config\opencode"

Write-Host "Sincronizando $src -> $dst"
robocopy (Join-Path $src "skills") (Join-Path $dst "skills") /E /XD node_modules __pycache__ /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "robocopy skills fallo con exit $LASTEXITCODE" }
robocopy (Join-Path $src "agents") (Join-Path $dst "agents") /E /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "robocopy agents fallo con exit $LASTEXITCODE" }
robocopy (Join-Path $src "commands") (Join-Path $dst "commands") /E /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "robocopy commands fallo con exit $LASTEXITCODE" }

$skills = (Get-ChildItem (Join-Path $dst "skills") -Directory).Count
$agents = (Get-ChildItem (Join-Path $dst "agents") -File).Count
$cmds = (Get-ChildItem (Join-Path $dst "commands") -File).Count
Write-Host "OK: skills=$skills agentes=$agents commands=$cmds en $dst"
Write-Host "Reinicia OpenCode para que recargue skills y agentes."
