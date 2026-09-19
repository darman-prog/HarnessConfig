---
name: workflow
description: Flujo Git: ramas, Conventional Commits, commits por paso de plan, PRs, Definition of Done. Usar al preparar cambios, commits, ramas o entregas. No cubre testing; usa la skill testing.
---

# Workflow

- Preguntarle al usuario si mantener `main` protegida y trabajar en ramas `feat/`, `fix/`, `refactor/`, `test/` o `chore/` o seguir con la rama actual.

- Usa Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:` y `chore:`.

- La descripcion del commit es SIEMPRE general y autocontenida: debe decir que cambio o que se arreglo para que cualquiera entienda el commit leyendo solo el historial. Nunca menciones unidades internas de planes, sprints ni entregas (bloques, pasos, "b1", "fase X").
  
  - Correcto: `feat: actualizacion de la api REST en el backend`
  - Incorrecto: `feat: creacion de component Bloque b1` (expone estructura interna del plan y no dice que se cambio)

- Mantiene los cambios pequenos y enfocados; no mezcla refactors no relacionados con una feature.

- Ejecuta primero tests unitarios, despues integracion y finalmente E2E cuando el cambio lo requiera. Para estrategia de testing (que mockear, cobertura, herramientas) usa la skill `testing`.

- Todo PR debe incluir objetivo, impacto, riesgos, tests ejecutados y migraciones o configuracion necesarias.

- Usa el agente `auditor` antes de fusionar cambios que afecten seguridad, arquitectura o contratos API.

- Nunca confirma `.env`, credenciales, tokens ni artefactos generados.

## Commits por paso de plan

Cuando ejecutes un plan numerado:

- Cada paso con codigo terminado y verificado es una unidad de commit: propone el mensaje (formato de arriba), muestra `git diff --stat` y ESPERA el "si" del usuario antes de ejecutar `git commit`.
- Antes de proponer el commit del paso: revisa el diff completo y confirma que no haya secretos, `.env` ni artefactos. Los pasos intermedios son checkpoints y pueden quedar rotos; la DoD completa (lint/typecheck/tests) aplica al paso final o antes del PR.
- Commitea en la rama de trabajo vigente y si estas en main sugiere al usuario crear una rama y trabajar en otra.
- Si el repo no es git o no hay rama de trabajo, avisalo en una linea y sigue sin commitear.

## Definition of Done (obligatoria antes de terminar cualquier cambio)

1. Corre lint, typecheck y tests con los comandos reales del repo (buscalos en `AGENTS.md`, `package.json` o equivalentes). Si no existen, avisalo en una linea.
2. Revisa el diff completo (`git diff`/`git status`) antes de declarar terminado.
3. Confirma que no hay secretos, `.env` ni artefactos generados en el diff.
4. Tests actualizados junto al cambio (ver skill `testing`).
5. No crea documentacion ni archivos no pedidos; si el stack cambia, propon actualizar `AGENTS.md` o un ADR.
6. Si cambia un contrato de API, actualiza `contratos-api` o el ADR antes de cerrar.

Adapta comandos y nombres a los scripts existentes del repositorio. No incluye tutoriales de Git ni sintaxis de testing.
