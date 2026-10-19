<#
.SYNOPSIS
  Guardarrail de presupuesto del harness (OPENCODE.md + AGENTS.md agnostico, agentes, skills, descriptions).

.DESCRIPTION
  Verifica los topes acordados en docs/harness/presupuestos.md.
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

# Topes (fuente unica: docs/harness/presupuestos.md). OPENCODE.md se inyecta en cada
# sesion junto a AGENTS.md agnostico: el primero carga el Skill Gate, el segundo el contexto.
$MAX_OPENCODE_MD_TOTAL = 75
$MAX_AGENTS_MD         = 35
# Estimador chars/4 del coste fijo por sesion: OPENCODE.md + AGENTS.md + las 38 descripciones.
# Tope con holgura del ~15% sobre la medicion 2026-10-18 (~3685 tokens).
$MAX_TOKENS_INSTRUCCIONES = 4250
$MAX_AGENTS_TOTAL = 350
$MAX_AGENT        = 45
$MAX_SKILL        = 65
$MAX_SKILL_EXENTA = 180   # vendor o manuales (carga bajo demanda)
$MAX_DESC         = 45
$MAX_DESC_MANUAL  = 25
$presupuestos = Join-Path $Root "docs\harness\presupuestos.md"
Check (Test-Path -LiteralPath $presupuestos) "falta docs\harness\presupuestos.md (fuente unica de los topes)"

$EXENTAS_LINEAS = @('impeccable', 'frontend-design-review', 'habilidades-ofimaticas', 'informe-docx')
$MANUALES       = @('habilidades-ofimaticas', 'informe-docx')

$openCodeMd  = Join-Path $Root "OPENCODE.md"
$agnosticMd   = Join-Path $Root "AGENTS.md"
$agentsDir = Join-Path $Root ".opencode\agents"
$skillsDir = Join-Path $Root ".opencode\skills"
# Unica raiz de skills: .opencode/skills. No hay .agents/skills (Antigravity carga por ruta).
$skillRoots = @($skillsDir)
# 1) OPENCODE.md (Skill Gate + estilo + roster: se inyecta en cada sesion) + AGENTS.md agnostico
$openCodeLines = (Get-Content -LiteralPath $openCodeMd).Count
Check ($openCodeLines -le $MAX_OPENCODE_MD_TOTAL) "OPENCODE.md tiene $openCodeLines lineas (tope $MAX_OPENCODE_MD_TOTAL)"
$agnosticLines = (Get-Content -LiteralPath $agnosticMd).Count
Check ($agnosticLines -le $MAX_AGENTS_MD) "AGENTS.md tiene $agnosticLines lineas (tope $MAX_AGENTS_MD)"
# 1b) Tope de tokens del contexto fijo: OPENCODE.md + AGENTS.md + descripciones, /4.
# Las descripciones se inyectan siempre (metadata), asi que cuentan como coste fijo.
$tokChars = 0
foreach ($f in @($openCodeMd, $agnosticMd)) { $tokChars += (Get-Content -LiteralPath $f -Raw).Length }
$tokDesc = 0
foreach ($sd in $skillRoots) {
  foreach ($sk in @(Get-ChildItem -LiteralPath $sd -Recurse -Filter SKILL.md -ErrorAction SilentlyContinue)) {
    $dm = Select-String -LiteralPath $sk.FullName -Pattern '^description:\s*(.+)\s*$' | Select-Object -First 1
    if ($dm) { $tokDesc += $dm.Matches[1].Value.Length }
  }
}
$tokEst = [math]::Round(($tokChars + $tokDesc) / 4)
Check ($tokEst -le $MAX_TOKENS_INSTRUCCIONES) "tope de tokens chars/4: estimado $tokEst (tope $MAX_TOKENS_INSTRUCCIONES)"

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

# 2c) Roster de OPENCODE.md coherente con los mode reales
$rosterSrc = Get-Content -LiteralPath $openCodeMd -Raw
$roster = @{}
($rosterSrc -split "`n") | Where-Object { $_ -match 'Primarios \(Tab\)|Subagentes \(Task/@\)' } | ForEach-Object {
    $kind = if ($_ -match 'Primarios') { 'primary' } else { 'subagent' }
    foreach ($nm in [regex]::Matches($_, '`([^`]+)`')) { $roster[$nm.Groups[1].Value] = $kind }
}
foreach ($name in $agentMode.Keys) {
    Check ($roster.ContainsKey($name)) "el agente $name no figura en el roster de OPENCODE.md (Primarios/Subagentes)"
    if ($roster.ContainsKey($name)) {
        Check ($roster[$name] -eq $agentMode[$name]) "el roster de OPENCODE.md lista $name como $($roster[$name]) pero su mode es $($agentMode[$name])"
    }
}
foreach ($name in $roster.Keys) {
    Check ($agentMode.ContainsKey($name) -or ($BUILTIN_SUBAGENTS -contains $name)) "el roster de OPENCODE.md nombra '$name', que no es agente del repo ni subagent built-in"
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
$skillMdScope = @(Get-ChildItem -LiteralPath $skillRoots -Recurse -File -Filter *.md)
$delPattern = '(?i)(delega\w*|lanza\w*|invoca\w*|consulta\w*|re-?evalua\w*|usa el agente)\s*(?:en\s+|a\s+|con\s+)?`(build|plan)`'
foreach ($hit in @($skillMdScope | Select-String -Pattern $delPattern)) {
    $rel = $hit.Path.Substring($Root.Length).TrimStart('\')
    $verb = $hit.Matches[0].Groups[1].Value
    $target = $hit.Matches[0].Groups[2].Value
    Check $false "skill '$rel' manda a delegar en el primary '$target' ($verb): los primarios no son invocables por Task"
}

# 2f) El grafo de delegacion es aciclico: un agente no puede alcanzar a si mismo
#     (build -> plan es imposible porque plan es primary, pero el check lo verifica).
$graph = @{}
foreach ($a in $allowlists) {
    if (-not $graph.ContainsKey($a.From)) { $graph[$a.From] = @() }
    $graph[$a.From] += $a.To
}
function Reach($start, $node, $seen) {
    if ($node -eq $start) { return $true }
    if ($seen.Contains($node)) { return $false }
    $seen[$node] = $true
    foreach ($next in @($graph[$node])) {
        if ($null -ne $next -and (Reach $start $next $seen)) { return $true }
    }
    return $false
}
foreach ($src in $graph.Keys) {
    foreach ($nxt in @($graph[$src])) {
        Check (-not (Reach $src $nxt @{})) "ciclo de delegacion: $src puede alcanzarse a si mismo via $nxt"
    }
}

# 2g) Un agente que se declara de solo lectura no puede escribir por bash.
#     Un allowlist tipo "git diff*" incluye "git diff --output=<archivo>", que escribe.
foreach ($name in @($agentMode.Keys)) {
    $md = Join-Path $agentsDir "$name.md"
    if (-not (Test-Path -LiteralPath $md)) { continue }
    $fmLines = @()
    $closed = $false
    foreach ($l in (Get-Content -LiteralPath $md)) {
        if ($fmLines.Count -eq 0 -and $l -match '^\s*---\s*$') { continue }
        if ($l -match '^\s*---\s*$') { $closed = $true; break }
        $fmLines += $l
    }
    $fm = $fmLines -join "`n"
    if ($fm -notmatch 'solo lectura') { continue }
    Check ($fm -match '"\*--output\*":\s*deny') "$name se declara de solo lectura pero no bloquea '--output' en bash (podria escribir con git diff --output)"
}

# 2h) Sin BOM: el loader no publica el frontmatter si el archivo empieza con U+FEFF
#     (caso verificado: BOM + ':' en la description deja la skill fuera del catalogo).
$bomScope = @(Get-ChildItem -LiteralPath $agentsDir -File -Filter *.md -ErrorAction SilentlyContinue)
$bomScope += Get-ChildItem -LiteralPath $skillRoots -Recurse -File -Filter SKILL.md -ErrorAction SilentlyContinue
$commandsDirBom = Join-Path $Root ".opencode\commands"
if (Test-Path -LiteralPath $commandsDirBom) { $bomScope += Get-ChildItem -LiteralPath $commandsDirBom -File -Filter *.md -ErrorAction SilentlyContinue }
$bomFiles = @()
foreach ($f in $bomScope) {
    $b = [System.IO.File]::ReadAllBytes($f.FullName)
    if ($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) { $bomFiles += $f.FullName.Replace("$Root\", '') }
}
Check ($bomFiles.Count -eq 0) ("BOM (U+FEFF) en " + $bomFiles.Count + " archivo(s): " + (($bomFiles | Select-Object -First 5) -join ', '))

# 3) Skills: frontmatter fail-closed, name==carpeta, topes, descriptions y enlaces
$skillNames = @()
Get-ChildItem -LiteralPath $skillRoots -Recurse -Filter SKILL.md | ForEach-Object {
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

# 3b) Rutas en texto plano dentro de reference(s)/: un archivo dentro de reference/ que
#     cita `reference/x.md` en vez de `../x.md` es una ruta rota que el check de enlaces
#     (solo markdown) no ve.
Get-ChildItem -LiteralPath $skillRoots -Recurse -File -Filter *.md | ForEach-Object {
    $f = $_
    $fDir = Split-Path -Parent $f.FullName
    if ($fDir -match '[\\/]references?[\\/]') {
        $fText = Get-Content -LiteralPath $f.FullName -Raw
        foreach ($m in [regex]::Matches($fText, '`((?:reference|references)/[^`]+)`')) {
            $refRel = ($m.Groups[1].Value -split '#')[0]
            $ref = Join-Path $fDir $refRel
            Check (Test-Path -LiteralPath $ref) "ruta rota en $($f.Name): $refRel"
        }
    }
}

# 4) Routing bidireccional: cada skill del repo esta en la tabla; cada nombre de la tabla existe
$openCodeContent = Get-Content -LiteralPath $openCodeMd -Raw
foreach ($n in ($skillNames + 'customize-opencode')) {
    Check ($openCodeContent -match ('`' + [regex]::Escape($n) + '`')) "skill $n no aparece en la tabla de OPENCODE.md"
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
($openCodeContent -split "`n") | Where-Object { $_ -match '^\|' } | ForEach-Object {
    foreach ($m in [regex]::Matches($_, '`([^`]+)`')) {
        $t = $m.Groups[1].Value
        if ($t -match '^[a-z0-9][a-z0-9-]*$') { $tableNames += $t }
    }
}
foreach ($t in ($tableNames | Sort-Object -Unique)) {
    Check ($known -contains $t) "la tabla de OPENCODE.md menciona '$t' pero no existe como skill, agente ni customize-opencode"
}

# 4b) Las columnas Obligatoria/Opcional del Skill Gate solo admiten skills (no agentes):
#     un agente en esas columnas produce una instruccion imposible (skill("auditor") no existe).
$skillGateKnown = @($skillNames) + @('customize-opencode')
($openCodeContent -split "`n") | Where-Object { $_ -match '^\|' } | ForEach-Object {
    $cols = $_ -split '\|'
    if ($cols.Count -ge 4) {
        foreach ($ci in 2, 3) {
            foreach ($m in [regex]::Matches($cols[$ci], '`([^`]+)`')) {
                $t = $m.Groups[1].Value
                if ($t -match '^[a-z0-9][a-z0-9-]*$') {
                    Check ($skillGateKnown -contains $t) "la columna Obligatoria/Opcional del Skill Gate menciona '$t', que no es skill ni customize-opencode (los agentes van en la columna Senal)"
                }
            }
        }
    }
}

# 4c) code-clue es obligatoria para cualquier escritura de codigo, no depende de palabras del usuario.
#     La comparacion ignora acentos: la fila de OPENCODE.md dice "codigo" con tilde.
$codeRows = @($openCodeContent -split "`n" | Where-Object { $_ -match 'Escribir o modificar' })
Check ($codeRows.Count -eq 1) "OPENCODE.md debe tener una unica fila para escribir/modificar codigo"
    $codeCols = $codeRows[0] -split '\|'
    Check ($codeCols.Count -ge 3 -and $codeCols[2] -match '`code-clue`') "code-clue debe estar en Obligatoria para toda escritura o modificacion de codigo"

# 5) Fuente unica por regla
$scope = @()
$scope += Get-ChildItem -LiteralPath $skillRoots -Recurse -Filter *.md
$scope += Get-ChildItem -LiteralPath $agentsDir -Filter *.md
$scope += Get-Item -LiteralPath $openCodeMd

$wcag = @($scope | Select-String -Pattern 'WCAG 2\.1')
Check ($wcag.Count -eq 0) "'WCAG 2.1' aparece en $($wcag.Count) archivo(s); el canonico es 2.2 AA"

$err = @($scope | Select-String -Pattern 'code, message, details')
Check (($err.Count -eq 1) -and ($err[0].Path -match 'api-backend')) "el contrato de errores debe estar solo en api-backend (encontrado $($err.Count))"

$dod = @(Get-ChildItem -LiteralPath $skillRoots -Recurse -Filter SKILL.md | Select-String -Pattern '^## Definition of Done')
Check ($dod.Count -eq 1) "la DoD canonica debe estar solo en workflow (encontradas $($dod.Count))"

# 6) Probes de trigger (tier 1: cobertura literal de keywords en description o fila de tabla)
$probesFile = Join-Path $Root "scripts\trigger-probes.json"
$probes = $null
if (Test-Path -LiteralPath $probesFile) {
    try { $probes = Get-Content -LiteralPath $probesFile -Raw | ConvertFrom-Json } catch { Check $false "trigger-probes.json no es JSON valido" }
} else {
    Check $false "falta scripts\trigger-probes.json (probes de trigger)"
}
if ($null -ne $probes) {
    $rows = @($openCodeContent -split "`n" | Where-Object { $_ -match '^\|' })
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
    $probedSkills = @($probes | ForEach-Object { [string]$_.skill } | Select-Object -Unique)
    foreach ($reqSkill in ($skillNames + @('customize-opencode'))) {
        Check ($reqSkill -in $probedSkills) "la skill '$reqSkill' no tiene ningun probe en scripts\trigger-probes.json (cobertura 100% obligatoria)"
    }
}

# 7) Estilo de respuesta: fuente unica y precedencia
$styleSkill = 'comunicacion-asertiva'
Check ($openCodeContent -match ('Doctrina de redaccion.*`' + $styleSkill + '`')) "OPENCODE.md debe apuntar a la skill ``$styleSkill`` como doctrina del estilo"
$hardCapScope = @(Get-ChildItem -LiteralPath $skillRoots -Recurse -Filter SKILL.md) + @(Get-ChildItem -LiteralPath $agentsDir -Filter *.md) + @(Get-Item -LiteralPath $openCodeMd)
$hardCap = @($hardCapScope | Select-String -Pattern '5 bullets')
Check (($hardCap.Count -eq 1) -and ($hardCap[0].Path -eq $openCodeMd)) "el limite de bullets debe existir solo en OPENCODE.md (encontrado $($hardCap.Count) fuera de el)"
$styleFile = Join-Path $skillsDir "$styleSkill\SKILL.md"
if ($null -ne $styleFile) {
    $styleText = Get-Content -LiteralPath $styleFile -Raw
    Check ($styleText -match 'contradic[ae].*gana `(OPENCODE|GEMINI)\.md`') "la skill $styleSkill debe declarar que gana OPENCODE.md (o GEMINI.md en Antigravity) si contradice"
} else {
    Check $false "falta la skill $styleSkill (doctrina de estilo obligatoria)"
}

# 8) Convencion de documentacion: la doc del harness vive en docs/harness, no en .opencode/Logs
$estadoDoc = Join-Path $Root "docs\harness\estado-actual.md"
Check (Test-Path -LiteralPath $estadoDoc) "falta docs\harness\estado-actual.md (la documentacion del harness vive en docs\harness)"
$oldLogs = Join-Path $Root ".opencode\Logs"
Check (-not (Test-Path -LiteralPath $oldLogs)) ".opencode\Logs no debe existir: la documentacion del harness vive en docs\harness"

# 9) Permisos del global: external_directory no puede abrir todo el disco
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

# 10) Comandos: frontmatter con description y agent valido
$commandsDir = Join-Path $Root ".opencode\commands"
if (Test-Path -LiteralPath $commandsDir) {
    Get-ChildItem -LiteralPath $commandsDir -Filter *.md | ForEach-Object {
        $lines = Get-Content -LiteralPath $_.FullName
        $fm = @()
        $closed = $false
        if ($lines.Count -gt 0 -and $lines[0] -match '^\s*---\s*$') {
            for ($i = 1; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match '^\s*---\s*$') { $closed = $true; break }
                $fm += $lines[$i]
            }
        }
        Check $closed "command $($_.Name) sin cierre '---' del frontmatter"
        if (-not $closed) { return }
        $descLine = $fm | Select-String -Pattern '^description:\s*(.+?)\s*$' | Select-Object -First 1
        Check ($null -ne $descLine) "command $($_.Name) sin 'description:' en el frontmatter"
        $agentLine = $fm | Select-String -Pattern '^agent:\s*(.+?)\s*$' | Select-Object -First 1
        $agentVal = if ($null -ne $agentLine) { $agentLine.Matches[0].Groups[1].Value.Trim() } else { '' }
        Check ($agentVal -ne '') "command $($_.Name) sin 'agent:' en el frontmatter"
        if ($agentVal -ne '') {
            Check ($agentMode.ContainsKey($agentVal)) "command $($_.Name) nombra agente '$agentVal' que no existe en el roster"
        }
    }
} else {
    Check $false "falta .opencode\commands\ (directorio de comandos)"
}

# 11) Integridad de codificacion: una doble codificacion UTF-8 -> 1252 -> UTF-8
#     ("mojibake") convierte tildes y enie en basura. Se detecta por la firma de
#     caracteres que produce. Un script que lea con Get-Content sin -Encoding y
#     escriba con Set-Content -Encoding UTF8 la introduce sin avisar.
$mojibakeScope = @()
foreach ($raiz in @('.opencode', 'docs', 'scripts')) {
    $ruta = Join-Path $Root $raiz
    if (Test-Path -LiteralPath $ruta) {
        $mojibakeScope += Get-ChildItem -LiteralPath $ruta -Recurse -File -Include *.md, *.json, *.ps1, *.js -ErrorAction SilentlyContinue
    }
}
# -Include se ignora con -LiteralPath (traeria binarios): se acota por extension.
$mojibakeScope = @($mojibakeScope | Where-Object { $_.Extension -in @('.md', '.json', '.ps1', '.js') })
$mojibake = @()
foreach ($f in $mojibakeScope) {
    if ($f.FullName -match '\\(node_modules|vendor|dist)\\{1}') { continue }
    try {
        $t = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
        # Firma: un lead de doble codificacion (A-tilde, A-cirunfle, a-cirunfle) seguido de
        # un caracter de Windows-1252. El conjunto incluye U+20AC y los signos U+2013/U+2014,
        # que son los que aparecen en "a-cirunfle U+20AC U+201D" (raya) y "U+0153" (u con diaeresis).
        if ($t -match '[\u00C3\u00C2\u00E2][\u0080-\u00BF\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u0160\u0161\u017D\u017E\u0178\u0192\u02C6\u02DC\u0152\u0153\u20AC\u2122]') {
            $mojibake += $f.FullName.Replace("$Root\", '')
        }
    } catch { }
}
Check ($mojibake.Count -eq 0) ("mojibake (doble codificacion UTF-8) en " + $mojibake.Count + " archivo(s): " + (($mojibake | Select-Object -First 5) -join ', '))

# 11b) Caracteres de control invisibles: un here-string doble de PowerShell interpreta
#      backtick+a como BEL, backtick+b como backspace y backtick+0 como NUL, y se come letras.
#      Se excluyen tab (09), LF (0A) y CR (0D), que son legitimos en el texto.
$ctrl = @()
foreach ($f in $mojibakeScope) {
    if ($f.FullName -match '\\(node_modules|vendor|dist)\\{1}') { continue }
    try {
        $t = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
        if ($t -match '[\u0000-\u0008\u000B\u000C\u000E-\u001F]') { $ctrl += $f.FullName.Replace("$Root\", '') }
    } catch { }
}
Check ($ctrl.Count -eq 0) ("caracteres de control invisibles en " + $ctrl.Count + " archivo(s): " + (($ctrl | Select-Object -First 5) -join ', '))

# 12) Instrucciones del harness: OPENCODE.md = Skill Gate + estilo + roster;
#     AGENTS.md = contexto agnostico. El deny de GEMINI.md se conserva como defensa:
#     si alguien deja un GEMINI.md en la raiz, OpenCode no lo lee.
$agnosticText = Get-Content -LiteralPath $agnosticMd -Raw
$openCodeTable = @($openCodeContent -split "`n" | Where-Object { $_ -match '^\| Tipo de tarea' })
Check ($openCodeTable.Count -ge 1) "OPENCODE.md debe contener la tabla del Skill Gate"
Check (-not (($agnosticText -split "`n") | Where-Object { $_ -match '^\| Tipo de tarea' })) "AGENTS.md no debe contener la tabla del Skill Gate (vive en OPENCODE.md)"
$projCfgPath = Join-Path $Root ".opencode\opencode.json"
$projCfgText = Get-Content -LiteralPath $projCfgPath -Raw
$instrMatch = [regex]::Match($projCfgText, '"instructions"\s*:\s*\[(.*?)\]', [System.Text.RegularExpressions.RegexOptions]::Singleline)
Check $instrMatch.Success 'opencode.json debe declarar "instructions" (lista de ficheros de reglas)'
if ($instrMatch.Success) {
    $instrList = $instrMatch.Groups[1].Value
    Check ($instrList -match '"OPENCODE\.md"') 'instructions debe incluir "OPENCODE.md"'
    Check ($instrList -notmatch '"AGENTS\.md"') 'instructions no debe listar "AGENTS.md" (el auto-descubrimiento duplicaria la inyeccion)'
}
Check (($projCfgText -match '"read"') -and ($projCfgText -match '\*GEMINI\.md"\s*:\s*"deny"')) "permission.read debe denegar GEMINI.md (defensa: ese fichero no es de este harness)"

# Resultado
if ($script:fail.Count -gt 0) {
    Write-Host "GUARDARRAIL DE PRESUPUESTO: $($script:fail.Count) violacion(es)"
    $script:fail | ForEach-Object { Write-Host " - $_" }
    exit 1
}
Write-Host "Guardarrail de presupuesto OK: OPENCODE.md=$openCodeLines lineas (tope $MAX_OPENCODE_MD_TOTAL) | AGENTS.md=$agnosticLines (tope $MAX_AGENTS_MD) | skills=$($skillNames.Count) archivos SKILL.md | agentes=$agentCount archivos, $agentsTotal lineas en total (tope $MAX_AGENTS_TOTAL)"
exit 0
