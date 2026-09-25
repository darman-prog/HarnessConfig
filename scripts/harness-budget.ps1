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
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [string]$GlobalConfig = (Join-Path $env:USERPROFILE ".config\opencode\opencode.jsonc")
)

$ErrorActionPreference = "Stop"
$script:fail = @()
function Check($cond, $msg) { if (-not $cond) { $script:fail += $msg } }

# Topes (fuente unica: docs/specs/001-reestructura-skills-ahorro-tokens.md)
$MAX_AGENTS_MD_TOTAL = 60
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
Check ($agentsLines -le $MAX_AGENTS_MD_TOTAL) "AGENTS.md tiene $agentsLines lineas (tope $MAX_AGENTS_MD_TOTAL)"

# 2) Agentes: topes (se pagan por invocacion) + contrato de roles y permisos
$BUILTIN_SUBAGENTS = @('explore', 'general', 'scout', 'title', 'summary', 'compaction')
$VALID_MODES      = @('primary', 'subagent', 'all')
$agentsTotal = 0
$agentCount  = 0
$agentMode   = @{}
$allowlists  = @()
Get-ChildItem -LiteralPath $agentsDir -Filter *.md | ForEach-Object {
    $lines = Get-Content -LiteralPath $_.FullName
    $n = $lines.Count
    $agentsTotal += $n
    $agentCount++
    Check ($n -le $MAX_AGENT) "agente $($_.Name) tiene $n lineas (tope $MAX_AGENT)"
    $name = [IO.Path]::GetFileNameWithoutExtension($_.Name)

    # Frontmatter delimitado: fuera de el el loader no lee la metadata.
    $fm = @()
    $closed = $false
    if ($lines.Count -gt 0 -and $lines[0] -match '^\s*---\s*$') {
        for ($i = 1; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^\s*---\s*$') { $closed = $true; break }
            $fm += $lines[$i]
        }
    }
    Check $closed "agente $name sin cierre '---' del frontmatter"

    $modeLine = $fm | Select-String -Pattern '^mode:\s*(.+?)\s*$' | Select-Object -First 1
    $mode = if ($null -ne $modeLine) { $modeLine.Matches[0].Groups[1].Value.Trim() } else { '' }
    Check ($mode -in $VALID_MODES) "agente $name sin 'mode:' explicito y valido (primary|subagent|all; el default es all): '$mode'"
    $agentMode[$name] = $mode

    # Sin 'task:' explicito el permiso queda en el default documentado: allow (fail-open).
    $taskLine = $fm | Select-String -Pattern '^\s+task:\s*(.+?)\s*$' | Select-Object -First 1
    $taskVal = if ($null -ne $taskLine) { $taskLine.Matches[0].Groups[1].Value.Trim() } else { '' }
    Check ($taskVal -ne '') "agente $name sin 'task:' explicito en permission (el default es allow)"

    foreach ($tm in [regex]::Matches($taskVal, '"([^"]+)"\s*:')) {
        $target = $tm.Groups[1].Value
        if ($target -ne '*' -and $target -notmatch '[\*\?]') {
            $allowlists += [pscustomobject]@{ From = $name; To = $target }
        }
    }

    # Un subagent no puede delegar en un primary: los primarios no son invocables por Task.
    if ($mode -eq 'subagent') {
        $body = ($lines -join "`n")
        $bad = @([regex]::Matches($body, 'delega(?:ndo)?\s+(?:en\s+|a\s+)?`(build|plan|ui-ux|backend-expert)`') |
            ForEach-Object { $_.Groups[1].Value })
        Check ($bad.Count -eq 0) "el subagent $name dice que delega en $(($bad | Sort-Object -Unique) -join ', '), que no es invocable por Task"
    }
}
Check ($agentsTotal -le $MAX_AGENTS_TOTAL) "agentes suman $agentsTotal lineas (tope $MAX_AGENTS_TOTAL)"

# 2b) Allowlists de task: cada destino existe y es invocable
foreach ($a in $allowlists) {
    if ($BUILTIN_SUBAGENTS -contains $a.To) { continue }
    Check ($agentMode.ContainsKey($a.To)) "la allowlist task de $($a.From) nombra '$($a.To)', que no existe como agente"
    if ($agentMode.ContainsKey($a.To)) {
        Check ($agentMode[$a.To] -in @('subagent', 'all')) "la allowlist task de $($a.From) nombra a $($a.To) (mode: $($agentMode[$a.To])), que no es invocable por Task"
    }
}

# 2c) Roster de AGENTS.md coherente con los mode reales
$rosterSrc = Get-Content -LiteralPath $agentsMd -Raw
$roster = @{}
($rosterSrc -split "`n") | Where-Object { $_ -match 'Primarios \(Tab\)|Subagentes \(Task/@\)' } | ForEach-Object {
    $kind = if ($_ -match 'Primarios') { 'primary' } else { 'subagent' }
    foreach ($nm in [regex]::Matches($_, '`([^`]+)`')) { $roster[$nm.Groups[1].Value] = $kind }
}
foreach ($name in $agentMode.Keys) {
    Check ($roster.ContainsKey($name)) "el agente $name no figura en el roster de AGENTS.md (Primarios/Subagentes)"
    if ($roster.ContainsKey($name)) {
        Check ($roster[$name] -eq $agentMode[$name]) "el roster de AGENTS.md lista $name como $($roster[$name]) pero su mode es $($agentMode[$name])"
    }
}
foreach ($name in $roster.Keys) {
    Check ($agentMode.ContainsKey($name) -or ($BUILTIN_SUBAGENTS -contains $name)) "el roster de AGENTS.md nombra '$name', que no es agente del repo ni subagent built-in"
}

# 2d) Contrato de finales de linea declarado en el repo (no en cada maquina)
$attrs = Join-Path $Root ".gitattributes"
if (Test-Path -LiteralPath $attrs) {
    Check ((Get-Content -LiteralPath $attrs -Raw) -match '(?m)^\*\.md\s+text\s+eol=lf') ".gitattributes debe fijar '*.md text eol=lf'"
} else {
    Check $false "falta .gitattributes con '*.md text eol=lf'"
}

# 2e) Las skills (y sus references) tampoco pueden mandar a delegar en un primary:
#     un primary no es invocable por Task, asi que la instruccion es imposible.
$skillMdScope = @(Get-ChildItem -LiteralPath $skillsDir -Recurse -File -Filter *.md)
$delPattern = '(?i)(delega\w*|lanza\w*|invoca\w*|consulta\w*|re-?evalua\w*|usa el agente)\s*(?:en\s+|a\s+|con\s+)?`(build|plan)`'
foreach ($hit in @($skillMdScope | Select-String -Pattern $delPattern)) {
    $rel = $hit.Path.Substring($skillsDir.Length).TrimStart('\')
    $verb = $hit.Matches[0].Groups[1].Value
    $target = $hit.Matches[0].Groups[2].Value
    Check $false "skill '$rel' manda a delegar en el primary '$target' ($verb): los primarios no son invocables por Task"
}

# 3) Skills: frontmatter fail-closed, name==carpeta, topes, descriptions y enlaces
$skillNames = @()
Get-ChildItem -LiteralPath $skillsDir -Recurse -Filter SKILL.md | ForEach-Object {
    $file   = $_
    $lines  = Get-Content -LiteralPath $file.FullName
    $folder = Split-Path -Leaf (Split-Path -Parent $file.FullName)
    $text   = $lines -join "`n"

    # Frontmatter delimitado: sin name/description el loader no anuncia la skill (fail-closed).
    $fm = @()
    $closed = $false
    if ($lines.Count -gt 0 -and $lines[0] -match '^\s*---\s*$') {
        for ($i = 1; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^\s*---\s*$') { $closed = $true; break }
            $fm += $lines[$i]
        }
    }
    Check $closed "SKILL.md sin cierre '---' del frontmatter ($folder)"
    if (-not $closed) { return }
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
        $miss = @($p.keywords | Where-Object { $haystack -notmatch [regex]::Escape(([string]$_).ToLowerInvariant()) })
        if ($miss.Count -gt 0) { Check $false "probe '$(($p.prompt))' no tiene todas las keywords de '$s' en su description ni en su fila (faltan: $($miss -join ', '))" }
    }
}

# 8) Estilo de respuesta: fuente unica y precedencia
$styleSkill = 'comunicacion-asertiva'
Check ($agentsContent -match ('Doctrina de redaccion.*`' + $styleSkill + '`')) "AGENTS.md debe apuntar a la skill ``$styleSkill`` como doctrina del estilo"
$hardCapScope = @(Get-ChildItem -LiteralPath $skillsDir -Recurse -Filter SKILL.md) + @(Get-ChildItem -LiteralPath $agentsDir -Filter *.md) + @(Get-Item -LiteralPath $agentsMd)
$hardCap = @($hardCapScope | Select-String -Pattern '5 bullets')
Check (($hardCap.Count -eq 1) -and ($hardCap[0].Path -eq $agentsMd)) "el limite de bullets debe existir solo en AGENTS.md (encontrado $($hardCap.Count) fuera de el)"
$styleFile = Join-Path $skillsDir "$styleSkill\SKILL.md"
if (Test-Path -LiteralPath $styleFile) {
    $styleText = Get-Content -LiteralPath $styleFile -Raw
    Check ($styleText -match 'contradic[ae].*gana `AGENTS\.md`') "la skill $styleSkill debe declarar que gana AGENTS.md si contradice"
} else {
    Check $false "falta la skill $styleSkill (doctrina de estilo obligatoria)"
}

# 9) Convencion de documentacion: la doc del harness vive en docs/harness, no en .opencode/Logs
$estadoDoc = Join-Path $Root "docs\harness\estado-actual.md"
Check (Test-Path -LiteralPath $estadoDoc) "falta docs\harness\estado-actual.md (la documentacion del harness vive en docs\harness)"
$oldLogs = Join-Path $Root ".opencode\Logs"
Check (-not (Test-Path -LiteralPath $oldLogs)) ".opencode\Logs no debe existir: la documentacion del harness vive en docs\harness"

# 10) Permisos del global: external_directory no puede abrir todo el disco
# (si el global aun no existe no hay politica que policar; si existe, se exige la allowlist)
if (Test-Path -LiteralPath $GlobalConfig) {
    $cfg = Get-Content -LiteralPath $GlobalConfig -Raw
    $m = [regex]::Match($cfg, '"external_directory"\s*:\s*(\{[^}]*\}|"[^"]*")')
    Check $m.Success "el global debe declarar permission.external_directory (no se encontro el bloque)"
    if ($m.Success) {
        if ($m.Groups[1].Value -notmatch '^\{') {
            Check ($m.Groups[1].Value -notmatch '^"\s*allow\s*"$') 'external_directory no puede ser el shorthand "allow"'
        } else {
            Check (-not ($m.Groups[1].Value -match '"\*"\s*:\s*"allow"')) 'external_directory no puede llevar "*": "allow" (anula las allowlists internas de opencode)'
        }
    }
} else {
    Write-Host "Nota: no existe $GlobalConfig; se omite el check de external_directory"
}

# Resultado
if ($script:fail.Count -gt 0) {
    Write-Host "GUARDARRAIL DE PRESUPUESTO: $($script:fail.Count) violacion(es)"
    $script:fail | ForEach-Object { Write-Host " - $_" }
    exit 1
}
Write-Host "Guardarrail de presupuesto OK: AGENTS.md=$agentsLines lineas (tope $MAX_AGENTS_MD_TOTAL) | skills=$($skillNames.Count) archivos SKILL.md | agentes=$agentCount archivos, $agentsTotal lineas en total (tope $MAX_AGENTS_TOTAL)"
exit 0
