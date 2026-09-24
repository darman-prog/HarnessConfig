# sync-global.ps1 — sincroniza la plantilla (repo-fuente) hacia el harness global de OpenCode
# Uso:
#   powershell -File .\sync-global.ps1              # si hay obsoletos en el global, los LISTA y PARA (no borra)
#   powershell -File .\sync-global.ps1 -ForcePurge  # apruebas explicitamente borrar los obsoletos listados
#
# Que hace:
#   1. Corre el guardarrail de presupuesto (fail-closed).
#   2. Dry-run: enumera que se purgaria en skills/, agents/ y commands/ y PARA si hay algo.
#   3. Copia esas 3 carpetas con /MIR (purga acotada: dentro de ellas borra lo obsoleto).
#      NO toca la config global: opencode.json(c), tui.json, plugins/, package.json,
#      node_modules/ y los perfiles qa/notion quedan intactos.
#   4. Verifica que el global sea espejo del repo (mismos SKILL.md, mismo contenido).
#   5. Trunca opencode.log si supera 10 MB (mantiene las trazas locales pequenas).
#
# Los cambios en agentes/skills requieren REINICIAR OpenCode (la config no es hot-reload).

param([switch]$ForcePurge)

$ErrorActionPreference = "Stop"
$src = Join-Path $PSScriptRoot ".opencode"
$dst = Join-Path $env:USERPROFILE ".config\opencode"
$SUBFOLDERS = @('skills', 'agents', 'commands')

# ── 1) Guardarrail de presupuesto: valida la plantilla ANTES de sincronizar ──
$budgetScript = Join-Path $PSScriptRoot "scripts\harness-budget.ps1"
if (Test-Path -LiteralPath $budgetScript) {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $budgetScript -Root $PSScriptRoot
    if ($LASTEXITCODE -ne 0) { throw "Guardarrail de presupuesto: violaciones detectadas (exit $LASTEXITCODE). Corrige la plantilla y reintenta." }
} else {
    throw "No se encontro scripts\harness-budget.ps1; el sync exige el guardarrail (fail-closed)."
}

# ── 2) Dry-run: que se purgaria en el global (sin tocar nada) ───────────────
# El parser es independiente del idioma de robocopy: en español las lineas son
# "*Directorio EXTRA"/"*Archivo EXTRA"; en ingles, "*EXTRA File"/"*deleting".
# Regla: toda linea que empieza con '*' y contiene un marcador de borrado + una ruta absoluta.
$purgeables = @()
foreach ($sub in $SUBFOLDERS) {
    $s = Join-Path $src $sub
    $d = Join-Path $dst $sub
    if (-not (Test-Path -LiteralPath $s)) { continue }
    $out = robocopy $s $d /MIR /L /R:0 /W:0 /NJH /NJS /NP 2>&1
    foreach ($line in $out) {
        $t = [string]$line
        if ($t -match '^\s*\*' -and $t -match '(?i)(EXTRA|deleting|BORR)' -and $t -match '([A-Za-z]:\\.*?)\s*$') {
            $path = $Matches[1].Trim()
            if ($path -like "$dst*") { $purgeables += $path }
        }
    }
}
$purgeables = @($purgeables | Sort-Object -Unique)
if ($purgeables.Count -gt 0) {
    Write-Host "Purgables en el global (NO se borran en esta corrida):"
    $purgeables | ForEach-Object { Write-Host "  - $_" }
    if (-not $ForcePurge) {
        throw "Sync detenido: $($purgeables.Count) obsoleto(s) en el global. Revisa la lista y re-ejecuta con -ForcePurge para borrarlos."
    }
    Write-Host "Aprobado con -ForcePurge: se borraran $($purgeables.Count) archivo(s)."
} else {
    Write-Host "Purgables: 0 (el global esta alineado con el repo)."
}

# ── 3) Copia con purga acotada dentro de las 3 carpetas ─────────────────────
Write-Host "Sincronizando $src -> $dst ($($SUBFOLDERS -join ', '))"
foreach ($sub in $SUBFOLDERS) {
    $s = Join-Path $src $sub
    if (-not (Test-Path -LiteralPath $s)) { continue }
    $d = Join-Path $dst $sub
    robocopy $s $d /MIR /XD node_modules __pycache__ /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS
    if ($LASTEXITCODE -ge 8) { throw "robocopy $sub fallo con exit $LASTEXITCODE" }
}

# ── 4) Identidad repo <-> global: mismos SKILL.md, mismo contenido ──────────
# Se compara texto normalizado (CRLF/LF no cuenta): el unico diff posible es de contenido.
$skillsSrc = Join-Path $src 'skills'
$desajustes = @()
$repoSkills = @(Get-ChildItem -LiteralPath $skillsSrc -Recurse -Filter SKILL.md)
$repoSkills | ForEach-Object {
    $rel = $_.FullName.Substring($skillsSrc.Length).TrimStart('\')
    $target = Join-Path (Join-Path $dst 'skills') $rel
    if (-not (Test-Path -LiteralPath $target)) { $desajustes += "falta en el global: $rel"; return }
    $a = ((Get-Content -LiteralPath $_.FullName -Raw) -replace "`r`n", "`n")
    $b = ((Get-Content -LiteralPath $target -Raw) -replace "`r`n", "`n")
    if ($a -ne $b) { $desajustes += "difiere del repo: $rel" }
}
# Barrera 2: el global no puede tener mas skills que el repo (sobran archivos).
$globalCount = (Get-ChildItem -LiteralPath (Join-Path $dst 'skills') -Recurse -Filter SKILL.md).Count
if ($globalCount -ne $repoSkills.Count) {
    $desajustes += "el global tiene $globalCount SKILL.md y el repo $($repoSkills.Count) (sobran o faltan)"
}
if ($desajustes.Count -gt 0) {
    $desajustes | ForEach-Object { Write-Host " - $_" }
    throw "El global no es espejo del repo ($($desajustes.Count) desajustes). Revisa el sync."
}

# ── 5) Prune del log local ──────────────────────────────────────────────────
$logFile = Join-Path $env:USERPROFILE ".local\share\opencode\log\opencode.log"
if (Test-Path -LiteralPath $logFile) {
    $mb = [math]::Round((Get-Item -LiteralPath $logFile).Length / 1MB, 1)
    if ($mb -gt 10) {
        try {
            Clear-Content -LiteralPath $logFile -ErrorAction Stop
            Write-Host "PRUNE: opencode.log truncado ($mb MB > 10 MB)."
        } catch {
            Write-Warning "PRUNE: no se pudo truncar opencode.log ($mb MB): $($_.Exception.Message)"
        }
    } else {
        Write-Host "PRUNE: opencode.log en $mb MB (umbral 10 MB)."
    }
}

# ── 6) Guardarrail del global: frontmatter con name y nombres unicos ─────────
$names = @{}
$sinName = @()
Get-ChildItem -LiteralPath (Join-Path $dst "skills") -Recurse -Filter SKILL.md | ForEach-Object {
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
    Write-Warning "Guardarrail: skills con problemas detectadas. Corrige en la plantilla (repo-fuente) y re-ejecuta el sync."
    exit 1
}

$skills = (Get-ChildItem -LiteralPath (Join-Path $dst "skills") -Recurse -Filter SKILL.md).Count
$agents = (Get-ChildItem -LiteralPath (Join-Path $dst "agents") -File).Count
$cmds = (Get-ChildItem -LiteralPath (Join-Path $dst "commands") -File).Count
Write-Host "OK: skills=$skills agentes=$agents commands=$cmds en $dst | identidad: OK"
Write-Host "Reinicia OpenCode para que recargue skills y agentes."
exit 0
