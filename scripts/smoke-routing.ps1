# smoke-routing.ps1 — Verifica en runtime que cada prompt gatilla la skill esperada.
#
# Uso: .\scripts\smoke-routing.ps1 [-Model opencode-go/deepseek-v4.1-flash]
# Cada caso corre `opencode run` una vez (modelo barato) y exige que la skill
# esperada aparezca entre las declaradas. Exit 0 = todo PASS; exit 1 = hay FAILs.
# Los casos espejan los gatillos de scripts/trigger-probes.json (verificacion estatica).

param(
  [string]$Model = "opencode-go/deepseek-v4.1-flash"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$cases = @(
  @{ prompt = "analiza este CSV y resume sus métricas";              skill = "analisis-datos" },
  @{ prompt = "automatiza estas tareas repetitivas con un script";   skill = "automatizacion" },
  @{ prompt = "quiero usar Notion en este proyecto";                 skill = "activacion-mcp" },
  @{ prompt = "define un MVP y ordena el roadmap";                   skill = "criterio-proyecto" },
  @{ prompt = "necesito un plan tecnico con dependencias y riesgos"; skill = "ingenieria-software" },
  @{ prompt = "resume este texto en 3 bullets";                      skill = "uso-eficiente" },
  @{ prompt = "mide la experiencia de usuario con SUS y UMUX-Lite";  skill = "evaluacion-experiencia" },
  @{ prompt = "retomar la feature multi-sesion en docs/features";    skill = "documentacion" },
  @{ prompt = "necesito correr los tests unitarios";                 skill = "testing" },
  @{ prompt = "disena un formulario de registro moderno y accesible"; skill = "ui-ux" },
  # Casos adyacentes: el prompt roza otra skill; debe declarar la correcta, no la evidentemente cercana.
  @{ prompt = "revisa la calidad del codigo de este modulo";       skill = "code-quality" },
  @{ prompt = "refactoriza este modulo con logica duplicada";      skill = "refactoring" },
  @{ prompt = "arregla este fallo intermitente de la API";          skill = "debugging" },
  @{ prompt = "escribe un README de este modulo";                  skill = "documentacion" },
  @{ prompt = "actualiza el indice del project-brain";              skill = "contexto-proyecto" },
  @{ prompt = "aplica TDD a este modulo nuevo";                    skill = "tdd" }
)

$pass = 0
$fail = @()

foreach ($c in $cases) {
  $q = 'Reply with just the skill name(s) you would load for: ' + $c.prompt
  Write-Host "`n[CASO] $($c.skill): $($c.prompt)"
  # El shim npm de opencode es un .ps1 que escribe errores de PowerShell en stderr;
  # con $ErrorActionPreference = "Stop" eso terminaria la llamada: se baja a Continue solo aqui.
  $prevEAP = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $out = & opencode run --model $Model $q 2>&1 | Out-String
  } catch {
    $out = ""
  }
  $ErrorActionPreference = $prevEAP
  # El nombre de la skill debe aparecer entre las declaradas (acepta backticks y coma).
  if ($out -match [regex]::Escape($c.skill)) {
    Write-Host "  PASS ($($c.skill) declarado)"
    $pass++
  } else {
    Write-Host "  FAIL (esperado: $($c.skill))"
    $fail += $c.skill
  }
}

Write-Host ""
Write-Host "Smokes de ruteo: $pass/$($cases.Count) PASS"
if ($fail.Count -gt 0) {
  Write-Host "FAIL en: $($fail -join ', ')"
  exit 1
}
Write-Host "OK: todas las skills esperadas se declararon."
