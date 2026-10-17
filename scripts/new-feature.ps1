param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]+(-[a-z0-9]+)*$')]
    [string]$Slug,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Title,

    [ValidateSet('borrador', 'aprobada', 'en-curso')]
    [string]$Status = 'borrador',

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$featuresDir = Join-Path $Root 'docs\features'
$indexFile = Join-Path $featuresDir 'INDEX.md'
$templateRef = Join-Path $Root '.opencode\skills\documentacion\references\FEATURE-SPEC.md'

if (-not (Test-Path -LiteralPath $featuresDir)) {
    throw "No existe el directorio de features: $featuresDir"
}
if (-not (Test-Path -LiteralPath $templateRef)) {
    throw "No existe la plantilla canonica DDR: $templateRef"
}

# Calculamos el siguiente ID correlativo (NNN) inspeccionando las specs existentes en docs/features/
$existingSpecs = @(Get-ChildItem -LiteralPath $featuresDir -Filter '*.md' -File | Where-Object { $_.Name -match '^(\d{3})-' })
$maxId = 0
foreach ($f in $existingSpecs) {
    if ($f.Name -match '^(\d{3})-(.+)\.md$') {
        $num = [int]$Matches[1]
        if ($num -gt $maxId) { $maxId = $num }
        if ($Matches[2] -eq $Slug) {
            throw "Ya existe una feature-spec con el slug '$Slug': $($f.Name)"
        }
    }
}
$nextId = '{0:D3}' -f ($maxId + 1)
$today = (Get-Date).ToString('yyyy-MM-dd')
$targetName = "$nextId-$Slug.md"
$targetPath = Join-Path $featuresDir $targetName

# Extraemos el bloque markdown de FEATURE-SPEC.md para mantener una sola fuente de verdad (Invariante 6)
$refRaw = [System.IO.File]::ReadAllText($templateRef, [System.Text.Encoding]::UTF8)
if ($refRaw -notmatch '(?s)```markdown\r?\n(.+?)\r?\n```') {
    throw "No se encontro el bloque ```markdown en $templateRef"
}
$emDash = [char]0x2014
$specBody = $Matches[1]
$specBody = $specBody -replace 'id:\s*NNN', "id: $nextId"
$specBody = $specBody -replace 'status:\s*borrador(\s+#.+)?', "status: $Status`$1"
$specBody = $specBody -replace 'created:\s*YYYY-MM-DD', "created: $today"
$specBody = $specBody -replace 'updated:\s*YYYY-MM-DD', "updated: $today"
$specBody = $specBody -replace '# Feature NNN\s+\S+\s+nombre funcional claro', "# Feature $nextId $emDash $Title"
$specBody = ($specBody -replace "`r`n", "`n").TrimEnd() + "`n"

# Preparamos la nueva fila en la seccion ## Activas de docs/features/INDEX.md
$indexRaw = [System.IO.File]::ReadAllText($indexFile, [System.Text.Encoding]::UTF8) -replace "`r`n", "`n"
$newRow = "| $today | $Title | $Status | Pendiente de detallar | [$targetName]($targetName) | $emDash |"

if ($DryRun) {
    Write-Host "[DryRun] Se crearia: docs/features/$targetName (id=$nextId, status=$Status)"
    Write-Host "[DryRun] Fila para docs/features/INDEX.md:"
    Write-Host "  $newRow"
    exit 0
}

# Escribimos en UTF-8 sin BOM y con saltos de linea LF para cumplir el guardarrail (Checks 2e y 2h)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($targetPath, $specBody, $utf8NoBom)

$marker = "## Activas`n`n| Fecha | Cambio | Estado | Alcance | Registro | Evidencia |`n|---|---|---|---|---|---|"
if ($indexRaw.Contains($marker)) {
    $updatedIndex = $indexRaw.Replace($marker, "$marker`n$newRow")
    [System.IO.File]::WriteAllText($indexFile, $updatedIndex, $utf8NoBom)
} else {
    Write-Warning "No se encontro el encabezado exacto de '## Activas' en INDEX.md; agrega la fila manualmente."
}

Write-Host "Creada feature-spec DDR: docs/features/$targetName y registrada en docs/features/INDEX.md"
