# sync-global.ps1 — sincroniza la plantilla (repo-fuente) hacia el harness global de OpenCode
# Uso: powershell -File .\sync-global.ps1
# Sobrescribe skills/agentes/commands del global con la version de esta plantilla.
# NO sincroniza configs de proyecto (opencode.json, perfiles qa/notion) ni MCP.

$ErrorActionPreference = "Stop"
$src = Join-Path $PSScriptRoot ".opencode"
$dst = Join-Path $env:USERPROFILE ".config\opencode"

# Guardarrail de presupuesto: valida la plantilla ANTES de sincronizar (aborta si hay violaciones).
$budgetScript = Join-Path $PSScriptRoot "scripts\harness-budget.ps1"
if (Test-Path -LiteralPath $budgetScript) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $budgetScript -Root $PSScriptRoot
    if ($LASTEXITCODE -ne 0) { throw "Guardarrail de presupuesto: violaciones detectadas (exit $LASTEXITCODE). Corrige la plantilla y reintenta." }
} else {
    throw "No se encontro scripts\harness-budget.ps1; el sync exige el guardarrail (fail-closed)."
}

Write-Host "Sincronizando $src -> $dst"
robocopy (Join-Path $src "skills") (Join-Path $dst "skills") /E /XD node_modules __pycache__ /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "robocopy skills fallo con exit $LASTEXITCODE" }
robocopy (Join-Path $src "agents") (Join-Path $dst "agents") /E /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "robocopy agents fallo con exit $LASTEXITCODE" }
robocopy (Join-Path $src "commands") (Join-Path $dst "commands") /E /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { throw "robocopy commands fallo con exit $LASTEXITCODE" }

$skills = (Get-ChildItem -LiteralPath (Join-Path $dst "skills") -Recurse -Filter SKILL.md).Count
$agents = (Get-ChildItem (Join-Path $dst "agents") -File).Count
$cmds = (Get-ChildItem (Join-Path $dst "commands") -File).Count
Write-Host "OK: skills=$skills agentes=$agents commands=$cmds en $dst"
Write-Host "Reinicia OpenCode para que recargue skills y agentes."

# ── Guardarrail NO destructivo: validar SKILL.md del global ──────────────
# 1) Todo SKILL.md debe tener frontmatter con `name:` (sin name, el registry lo filtra en silencio).
# 2) El `name` debe ser unico (duplicado = colision de skill). Solo frontmatter, nunca el cuerpo.
$names = @{}
$sinName = @()
Get-ChildItem -Path (Join-Path $dst "skills") -Recurse -Filter SKILL.md | ForEach-Object {
    $lines = Get-Content -LiteralPath $_.FullName
    if ($lines.Count -ge 1 -and $lines[0] -match '^\s*---\s*$') {
        $fmName = $null
        for ($i = 1; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^\s*---\s*$') { break }   # fin del frontmatter
            if ($null -eq $fmName -and $lines[$i] -match '^\s*name:\s*(.+?)\s*$') { $fmName = $Matches[1] }
        }
        if ($fmName) {
            if ($names.ContainsKey($fmName)) { $names[$fmName] += $_.FullName }
            else { $names[$fmName] = @($_.FullName) }
        } else {
            $sinName += $_.FullName
        }
    } else {
        $sinName += $_.FullName
    }
}

$problemas = 0
foreach ($n in $names.Keys) {
    if ($names[$n].Count -gt 1) {
        Write-Host ("WARN SKILL DUPLICADA: name={0} -> {1}" -f $n, ($names[$n] -join ", "))
        $problemas = $true
    }
}
foreach ($p in $sinName) {
    Write-Host "WARN SKILL SIN NAME: $p"
    $problemas = $true
}
if ($problemas) {
    Write-Warning "Guardarrail: skills con problemas detectadas. Corrige en la plantilla (repo-fuente) y re-ejecuta. El sync NO borra nada."
    exit 1
}

# Robocopy devuelve 1 cuando copia archivos (exito); forzamos el codigo de exito del sync.
exit 0
