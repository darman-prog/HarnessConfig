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

$EXENTAS_LINEAS = @('impeccable', 'habilidades-ofimaticas', 'informe-docx', 'notion-flow')
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

# 3) Skills: lineas, descriptions y enlaces locales
$skillNames = @()
Get-ChildItem -LiteralPath $skillsDir -Recurse -Filter SKILL.md | ForEach-Object {
    $lines = Get-Content -LiteralPath $_.FullName
    $nameLine = Select-String -LiteralPath $_.FullName -Pattern '^name:\s*(.+)$' | Select-Object -First 1
    $descLine = Select-String -LiteralPath $_.FullName -Pattern '^description:\s*(.+)$' | Select-Object -First 1
    $name = $nameLine.Matches[0].Groups[1].Value.Trim()
    $desc = $descLine.Matches[0].Groups[1].Value
    $descWords = ($desc -split '\s+' | Where-Object { $_ }).Count

    $capLines = if ($EXENTAS_LINEAS -contains $name) { $MAX_SKILL_EXENTA } else { $MAX_SKILL }
    $capDesc  = if ($MANUALES -contains $name)       { $MAX_DESC_MANUAL }  else { $MAX_DESC }
    Check ($lines.Count -le $capLines) "skill $name tiene $($lines.Count) lineas (tope $capLines)"
    Check ($descWords -le $capDesc)    "description de $name tiene $descWords palabras (tope $capDesc)"

    foreach ($m in [regex]::Matches(($lines -join "`n"), '\]\((references/[^)]+)\)')) {
        $ref = Join-Path (Split-Path -Parent $_.FullName) $m.Groups[1].Value
        Check (Test-Path -LiteralPath $ref) "enlace roto en ${name}: $($m.Groups[1].Value)"
    }

    $skillNames += $name
}
Check (($skillNames | Sort-Object -Unique).Count -eq $skillNames.Count) "hay nombres de skill duplicados"

# 4) Integridad de routing: toda skill (incluye el built-in) aparece en AGENTS.md
$agentsContent = Get-Content -LiteralPath $agentsMd -Raw
foreach ($n in ($skillNames + 'customize-opencode')) {
    Check ($agentsContent -match [regex]::Escape($n)) "skill $n no aparece en AGENTS.md"
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

# Resultado
if ($script:fail.Count -gt 0) {
    Write-Host "GUARDARRAIL DE PRESUPUESTO: $($script:fail.Count) violacion(es)"
    $script:fail | ForEach-Object { Write-Host " - $_" }
    exit 1
}
Write-Host "Guardarrail de presupuesto OK: AGENTS.md=$agentsLines lineas, agentes=$agentsTotal, skills=$($skillNames.Count)"
exit 0
