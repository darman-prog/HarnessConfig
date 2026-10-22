# new-feature.ps1 — wrapper de trace.py start
#
# Mantiene la interfaz historica (-Slug, -Title, -Status, -DryRun) y delega en el CLI
# portable, que es el unico que escribe el expediente y la fila del INDEX.
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]+(-[a-z0-9]+)*$')]
    [string]$Slug,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Title,

    [ValidateSet('borrador', 'aprobada', 'en-curso')]
    [string]$Status = 'borrador',

    [string]$Area = '',

    [string]$Summary = '',

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$trace = Join-Path $Root '.opencode\skills\documentacion\scripts\trace.py'

if (-not (Test-Path -LiteralPath $trace)) {
    throw "No existe el CLI de trazabilidad: $trace"
}
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python 3 no esta en PATH; es necesario para trace.py"
}

# El CLI resuelve plantillas y rutas; aqui no se duplica esa logica.
$traceArgs = @($trace, '--repo', $Root, 'start', '--slug', $Slug, '--title', $Title, '--status', $Status)
if ($Area) { $traceArgs += @('--area', $Area) }
if ($Summary) { $traceArgs += @('--summary', $Summary) }
if ($DryRun) { $traceArgs += '--dry-run' }

& python @traceArgs
exit $LASTEXITCODE
