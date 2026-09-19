---
name: ingenieria-software
description: Plan técnico basado en evidencia para cambios de software, dependencias, riesgos, edge cases, validación y spikes. Usar al preparar implementación sin editar código.
---

# Ingeniería de software

Produce planes técnicos accionables y verificables. Complementa al agente `plan` y a `arquitectura`; no sustituye sus reglas ni inventa estructura sin evidencia.

- Inspecciona primero estructura, contratos, tests y configuración relevantes.
- Separa decisiones confirmadas, supuestos y pendientes; pregunta por los pendientes críticos.
- Descompón tareas por dependencia y frontera afectada, incluyendo migraciones, contratos y documentación.
- Explicita riesgos, edge cases y criterios de aceptación observables.
- Define validación proporcional: unitarias, integración, E2E, lint, typecheck o pruebas manuales según riesgo.
- Propón spike/POC solo si una incertidumbre puede invalidar el enfoque; define pregunta, límite y criterio de salida.

Carga [PLAN-TECNICO.md](references/PLAN-TECNICO.md) bajo demanda para la plantilla detallada.
