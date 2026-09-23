# CLI de Impeccable (detector, excepciones y mantenimiento)

Sintaxis exacta del CLI oficial. El flujo y cuando usar cada comando vive en `SKILL.md`.
Comandos via el launcher local (sin red, sin `npx`): `.opencode/skills/impeccable/scripts/impeccable`
(en Windows sin `sh`, anade `.cmd`).

## Detector CLI (equivalente terminal del hook)

```bash
.opencode/skills/impeccable/scripts/impeccable detect src/                     # carpeta o archivo
.opencode/skills/impeccable/scripts/impeccable detect src/index.html          # archivo concreto
.opencode/skills/impeccable/scripts/impeccable detect --json src/              # para scripts/CI
.opencode/skills/impeccable/scripts/impeccable detect --scope type src/        # dominio: type, layout, ...
.opencode/skills/impeccable/scripts/impeccable detect --no-design-system src/  # un scan sin DESIGN.md
```

## Excepciones (siempre la mas estrecha primero)

```bash
.opencode/skills/impeccable/scripts/impeccable ignores add-value overused-font Inter --reason "Fuente de marca"
.opencode/skills/impeccable/scripts/impeccable ignores add-file "src/legacy/**"
.opencode/skills/impeccable/scripts/impeccable ignores add-rule side-tab
.opencode/skills/impeccable/scripts/impeccable ignores list
```

Inline en el archivo (viaja con el archivo): `<!-- impeccable-disable overused-font: razon -->`.
Config compartida: `.impeccable/config.json` (se commitea). Local: `config.local.json` (gitignored).
Si la config puede estar rota (claves malas, paths movidos): `/impeccable doctor`.

## Mantenimiento y atajos

- El launcher local no sale a la red: `update` si la requiere (`npx impeccable update`), o reinstalacion del pack.
- Comandos fijables como atajo: `/impeccable pin audit` -> crea `/audit`.
