---
name: tdd
description: TDD (driver/navigator con aprobacion del usuario): red-green-refactor, test primero, minima implementacion. Usar en logica compleja, contratos criticos o cuando el usuario pide TDD. No en UI, spikes ni triviales.
---

# TDD

## El ciclo

1. **Rojo**: escribe el test mas pequeno que falte y falla.
2. **Verde**: implementacion minima para que pase. Minima de verdad: nada "por si acaso" (YAGNI, skill `code-quality`).
3. **Refactor**: mejora nombres y estructura sin agregar comportamiento (skill `refactoring`).
4. Repite con el siguiente test. Cada ciclo cierra con tests en verde.

## Driver/Navigator con IA (colaboracion paso a paso)

- Tu (usuario) eres navigator: decides que test viene, el agente es driver que lo escribe.
- Flujo por paso con confirmacion:
  1. Agente propone el siguiente test (nombre + asserts) y ESPERA tu "si".
  2. Agente escribe el test; muestra el resultado en rojo.
  3. Agente implementa lo minimo; muestra el verde.
  4. Agente propone refactor si aplica; solo se ejecuta con tu aprobacion.
  5. Commit del ciclo (skill `workflow`, commits por paso de plan): propone mensaje y espera tu "si".
- El agente nunca salta pasos ni escribe test e implementacion de un tirón sin tu aprobacion.

## Cuando si y cuando no

- Si: logica de negocio compleja, reglas con bordes, contratos API, algoritmos con casos limite.
- No: UI visual (usa `ui-ux` + impeccable), spikes de exploracion, config trivial, CRUD sin reglas.
- Duda de estrategia general (niveles, que mockear): skill `testing`; duda de si refactorizar: skill `refactoring`.

## Reglas

- El test se escribe antes que el codigo; implementar primero anula el ciclo.
- Nombres de test describen comportamiento del negocio, no del metodo.
- Si el ciclo lleva 3 intentos de verde sin lograrlo, el diseño esta mal: para y reevalua con `plan` o `backend-expert`.
