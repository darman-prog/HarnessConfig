# Onboarding de trazabilidad

Se ejecuta en `inicio-proyecto`, después de sembrar el cerebro y antes del cierre. La meta: todo proyecto nace con su cola de trabajo y su registro.

## 1. Comprobar Python

```text
python --version
```

Debe ser 3.8 o superior. Si no está, avisa y no crees nada: la herramienta no puede correr.

## 2. Elegir el modo

- **Proyecto nuevo** (sin `docs/features/` o vacío): `init`.
- **Proyecto existente** (ya tiene `NNN-*.md`): `adopt --dry-run`, revisar la salida y luego `adopt`.

Ambos comandos usan el `trace.py` del directorio de la skill `documentacion`:

```text
python <base de documentacion>/scripts/trace.py --repo <raiz del proyecto> init --areas ui,backend,infra,product,docs
python <base de documentacion>/scripts/trace.py --repo <raiz del proyecto> adopt --default-area sin-clasificar --dry-run
python <base de documentacion>/scripts/trace.py --repo <raiz del proyecto> adopt --default-area sin-clasificar
```

## 3. Ajustar las áreas

Las áreas son del proyecto, no de la herramienta. Propón el conjunto según lo que exista (por ejemplo `ui,backend,data,infra,docs`) y déjalo escrito en la cabecera de `BACKLOG.md`. Si el proyecto es pequeño, tres áreas bastan.

## 4. Verificar

```text
python <base de documentacion>/scripts/trace.py --repo <raiz del proyecto> check
```

Debe terminar con `check OK`. Si lista registros sin `area`, ejecuta `adopt`; si lista conflictos de `.opencode` local, avisa de que ese proyecto anula las reglas globales.

## 5. Cierre del onboarding

Reporta: modo usado (`init` o `adopt`), áreas elegidas, número de registros importados y resultado de `check`. No inventes tareas: el backlog empieza vacío salvo lo que el usuario pida.
