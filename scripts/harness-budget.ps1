<#
.SYNOPSIS
  Guardarrail de presupuesto del harness (AGENTS.md, agentes, skills, descriptions, specs).

.DESCRIPTION
  Verifica los topes acordados en docs/specs/001-reestructura-skills-ahorro-tokens.md.
  Los conteos se derivan por glob (no hay cifras hardcodeadas).
  Exit 0 = todo en presupuesto; exit 1 = violaciones (listadas).

.EXAMPLE
  powershell -NoProfile -File .\scripts\harness-budget.ps1
#>
param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$script:fail = @()
function Check($cond, $msg) { if (-not $cond) { $script:fail += $msg } }

# Topes (fuente unica: docs/specs/001-reestructura-skills-ahorro-tokens.md)
$MAX_AGENTS_TOTAL = 310
$MAX_AGENT        = 45
$MAX_SKILL        = 65
$MAX_SKILL_EXENTA = 180   # vendor o manuales (carga bajo demanda)
$MAX_DESC         = 45
$MAX_DESC_MANUAL  = 25
$MAX_SPEC         = 200

$EXENTAS_LINEAS = @('impeccable', 'frontend-design-review', 'habilidades-ofimaticas', 'informe-docx', 'notion-flow')
$MANUALES       = @('habilidades-ofimaticas', 'informe-docx', 'notion-flow')

$agentsMd  = Join-Path $Root "AGENTS.md"
$agentsDir = Join-Path $Root ".opencode\agents"
$skillsDir = Join-Path $Root ".opencode\skills"

# 1) AGENTS.md (se inyecta en cada sesion)
$agentsLines = (Get-Content -LiteralPath $agentsMd).Count
Check ($agentsLines -le 60) "AGENTS.md tiene $agentsLines lineas (tope 60)"

# 2) Agentes (se pagan por invocacion)
$agentsTotal = 0
Get-ChildItem -LiteralPath $agentsDir -Filter *.md | ForEach-Object {
    $n = (Get-Content -LiteralPath $_.FullName).Count
    $agentsTotal += $n
    Check ($n -le $MAX_AGENT) "agente $($_.Name) tiene $n lineas (tope $MAX_AGENT)"
}
Check ($agentsTotal -le $MAX_AGENTS_TOTAL) "agentes suman $agentsTotal lineas (tope $MAX_AGENTS_TOTAL)"

# 3) Skills: frontmatter fail-closed, name==carpeta, topes, descriptions y enlaces
$skillNames = @()
Get-ChildItem -LiteralPath $skillsDir -Recurse -Filter SKILL.md | ForEach-Object {
    $file   = $_
    $lines  = Get-Content -LiteralPath $file.FullName
    $folder = Split-Path -Leaf (Split-Path -Parent $file.FullName)
    $text   = $lines -join "`n"

    # Frontmatter delimitado: sin name/description el loader no anuncia la skill (fail-closed).
    $fm = @()
    if ($lines.Count -gt 0 -and $lines[0] -match '^\s*---\s*$') {
        for ($i = 1; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^\s*---\s*$') { break }
            $fm += $lines[$i]
        }
    }
    $nameLine = $fm | Select-String -Pattern '^name:\s*(.+?)\s*$' | Select-Object -First 1
    $descLine = $fm | Select-String -Pattern '^description:\s*(.+?)\s*$' | Select-Object -First 1
    Check ($null -ne $nameLine) "SKILL.md sin 'name:' en el frontmatter ($folder)"
    Check ($null -ne $descLine) "SKILL.md sin 'description:' en el frontmatter ($folder)"
    if ($null -eq $nameLine -or $null -eq $descLine) { return }

    $name = $nameLine.Matches[0].Groups[1].Value.Trim()
    $desc = $descLine.Matches[0].Groups[1].Value
    Check ($name -eq $folder) "el name '$name' no coincide con la carpeta '$folder'"
    $descWords = ($desc -split '\s+' | Where-Object { $_ }).Count

    $capLines = if ($EXENTAS_LINEAS -contains $name) { $MAX_SKILL_EXENTA } else { $MAX_SKILL }
    $capDesc  = if ($MANUALES -contains $name)       { $MAX_DESC_MANUAL  } else { $MAX_DESC }
    Check ($lines.Count -le $capLines) "skill $name tiene $($lines.Count) lineas (tope $capLines)"
    Check ($descWords -le $capDesc)    "description de $name tiene $descWords palabras (tope $capDesc)"

    foreach ($m in [regex]::Matches($text, '\]\((references?/[^)]+)\)')) {
        $refRel = ($m.Groups[1].Value -split '#')[0]
        $ref = Join-Path (Split-Path -Parent $file.FullName) $refRel
        Check (Test-Path -LiteralPath $ref) "enlace roto en ${name}: $refRel"
    }

    $skillNames += $name
}
Check (($skillNames | Sort-Object -Unique).Count -eq $skillNames.Count) "hay nombres de skill duplicados"

# 4) Routing bidireccional: cada skill del repo esta en la tabla; cada nombre de la tabla existe
$agentsContent = Get-Content -LiteralPath $agentsMd -Raw
foreach ($n in ($skillNames + 'customize-opencode')) {
    Check ($agentsContent -match ('`' + [regex]::Escape($n) + '`')) "skill $n no aparece en la tabla de AGENTS.md"
}
$known = @($skillNames) + @('customize-opencode')
$globalSkills = Join-Path $env:USERPROFILE ".config\opencode\skills"
if (Test-Path -LiteralPath $globalSkills) {
    $known += Get-ChildItem -LiteralPath $globalSkills -Recurse -Filter SKILL.md | ForEach-Object {
        $g = (Get-Content -LiteralPath $_.FullName -TotalCount 12 | Select-String -Pattern '^name:\s*(.+?)\s*$' | Select-Object -First 1)
        if ($null -ne $g) { $g.Matches[0].Groups[1].Value.Trim() }
    }
}
$known += Get-ChildItem -LiteralPath $agentsDir -Filter *.md | ForEach-Object { [IO.Path]::GetFileNameWithoutExtension($_.Name) }
$tableNames = @()
($agentsContent -split "`n") | Where-Object { $_ -match '^\|' } | ForEach-Object {
    foreach ($m in [regex]::Matches($_, '`([^`]+)`')) {
        $t = $m.Groups[1].Value
        if ($t -match '^[a-z0-9][a-z0-9-]*$') { $tableNames += $t }
    }
}
foreach ($t in ($tableNames | Sort-Object -Unique)) {
    Check ($known -contains $t) "la tabla de AGENTS.md menciona '$t' pero no existe como skill, agente ni customize-opencode"
}

# 5) Fuente unica por regla
$scope = @()
$scope += Get-ChildItem -LiteralPath $skillsDir -Recurse -Filter *.md
$scope += Get-ChildItem -LiteralPath $agentsDir -Filter *.md
$scope += Get-Item -LiteralPath $agentsMd

$wcag = @($scope | Select-String -Pattern 'WCAG 2\.1')
Check ($wcag.Count -eq 0) "'WCAG 2.1' aparece en $($wcag.Count) archivo(s); el canonico es 2.2 AA"

$err = @($scope | Select-String -Pattern 'code, message, details')
Check (($err.Count -eq 1) -and ($err[0].Path -match 'contratos-api')) "el contrato de errores debe estar solo en contratos-api (encontrado $($err.Count))"

$dod = @(Get-ChildItem -LiteralPath $skillsDir -Recurse -Filter SKILL.md | Select-String -Pattern '^## Definition of Done')
Check ($dod.Count -eq 1) "la DoD canonica debe estar solo en workflow (encontradas $($dod.Count))"

# 6) Specs del repo
$specsDir = Join-Path $Root "docs\specs"
if (Test-Path -LiteralPath $specsDir) {
    Get-ChildItem -LiteralPath $specsDir -Filter *.md | ForEach-Object {
        $n   = (Get-Content -LiteralPath $_.FullName).Count
        $txt = Get-Content -LiteralPath $_.FullName -Raw
        Check ($n -le $MAX_SPEC) "spec $($_.Name) tiene $n lineas (tope $MAX_SPEC)"
        Check ($txt -match '(?m)^id:')     "spec $($_.Name) sin 'id' en el frontmatter"
        Check ($txt -match '(?m)^status:') "spec $($_.Name) sin 'status' en el frontmatter"
    }
}

# 7) Probes de trigger (tier 1: cobertura literal de keywords en description o fila de tabla)
$probesFile = Join-Path $Root "scripts\trigger-probes.json"
$probes = $null
if (Test-Path -LiteralPath $probesFile) {
    try { $probes = Get-Content -LiteralPath $probesFile -Raw | ConvertFrom-Json } catch { Check $false "trigger-probes.json no es JSON valido" }
} else {
    Check $false "falta scripts\trigger-probes.json (probes de trigger)"
}
if ($null -ne $probes) {
    $rows = @($agentsContent -split "`n" | Where-Object { $_ -match '^\|' })
    $descCache = @{}
    foreach ($p in $probes) {
        $s = [string]$p.skill
        if (-not $descCache.ContainsKey($s)) {
            $cand = @((Join-Path $skillsDir $s), (Join-Path $globalSkills $s)) |
                Where-Object { Test-Path -LiteralPath (Join-Path $_ "SKILL.md") } | Select-Object -First 1
            $descCache[$s] = if ($cand) { (Get-Content -LiteralPath (Join-Path $cand "SKILL.md") -TotalCount 8) -join ' ' } else { '' }
        }
        $surfaces = @($rows | Where-Object { $_ -match ('`' + [regex]::Escape($s) + '`') })
        $haystack = ((($surfaces -join ' ') + ' ' + $descCache[$s]).ToLowerInvariant())
        $hit = @($p.keywords | Where-Object { $haystack -match [regex]::Escape(([string]$_).ToLowerInvariant()) })
        if ($hit.Count -eq 0) { Check $false "probe '$(($p.prompt))' no encuentra keyword de '$s' en su description ni en su fila" }
    }
}

# Resultado
if ($script:fail.Count -gt 0) {
    Write-Host "GUARDARRAIL DE PRESUPUESTO: $($script:fail.Count) violacion(es)"
    $script:fail | ForEach-Object { Write-Host " - $_" }
    exit 1
}
Write-Host "Guardarrail de presupuesto OK: AGENTS.md=$agentsLines lineas, agentes=$agentsTotal, skills=$($skillNames.Count)"
exit 0
