# CLI de Impeccable (detector, excepciones y mantenimiento)

Sintaxis exacta del CLI oficial. El flujo y cuando usar cada comando vive en `SKILL.md`.

## Detector CLI (equivalente terminal del hook)

```bash
npx impeccable detect src/                     # carpeta o archivo
npx impeccable detect --json src/              # para scripts/CI
npx impeccable detect --scope type src/        # dominio: type, layout, ...
npx impeccable detect --no-design-system src/  # un scan sin DESIGN.md
```

## Excepciones (siempre la mas estrecha primero)

```bash
npx impeccable ignores add-value overused-font Inter --reason "Fuente de marca"
npx impeccable ignores add-file "src/legacy/**"
npx impeccable ignores add-rule side-tab
npx impeccable ignores list
```

Inline en el archivo (viaja con el archivo): `<!-- impeccable-disable overused-font: razon -->`.
Config compartida: `.impeccable/config.json` (se commitea). Local: `config.local.json` (gitignored).
Si la config puede estar rota (claves malas, paths movidos): `/impeccable doctor`.

## Mantenimiento y atajos

- `npx impeccable check` (desactualizado?), `npx impeccable update`, `/impeccable doctor`.
- Comandos fijables como atajo: `/impeccable pin audit` -> crea `/audit`.
