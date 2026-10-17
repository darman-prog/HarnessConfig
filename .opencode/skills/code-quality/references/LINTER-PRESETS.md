# Presets de Linter y Typecheck por Stack

> **Propósito:** Configuración base estricta para proyectos nuevos o existentes que adopten el harness. Aplica los umbrales de `code-quality` (complejidad ciclomática <= 10, sin `any` implícito, sin variables muertas ni promesas flotantes) desde el primer commit.

---

## 1. TypeScript / JavaScript (`tsconfig.json` + Biome o ESLint)

### `tsconfig.json` (estricto)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### `biome.json` (recomendado por velocidad)
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExcessiveCognitiveComplexity": {
          "level": "error",
          "options": { "maxAllowedComplexity": 10 }
        }
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noDoubleEquals": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      }
    }
  }
}
```

### Alternativa `eslint.config.mjs` (Flat Config)
- Reglas obligatorias:
  - `"complexity": ["error", { "max": 10 }]`
  - `"@typescript-eslint/no-explicit-any": "error"`
  - `"@typescript-eslint/no-floating-promises": "error"`
  - `"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]`

---

## 2. Python (`pyproject.toml` — Ruff + Mypy)

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "W", "I", "B", "UP", "SIM", "C90", "S"]
ignore = []

[tool.ruff.lint.mccabe]
max-complexity = 10

[tool.mypy]
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
no_implicit_optional = true
```

---

## 3. C# / .NET (`Directory.Build.props`)

```xml
<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
  </PropertyGroup>
</Project>
```

---

## 4. Go (`.golangci.yml`)

```yaml
linters:
  enable:
    - errcheck
    - govet
    - staticcheck
    - unused
    - gocyclo
    - gocognit
linters-settings:
  gocyclo:
    min-complexity: 10
  gocognit:
    min-complexity: 10
```
