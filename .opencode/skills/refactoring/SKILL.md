---
name: refactoring
description: Refactoring seguro de codigo existente: cuando refactorizar, pasos que preservan comportamiento, patrones comunes y manejo de deuda tecnica. Usar al mejorar estructura sin cambiar comportamiento, al reducir deuda tecnica o antes de extender codigo acoplado. No cubre features nuevas ni el diagnostico de bugs: para eso estan build y debugging.
---

# Refactoring

## Cuando refactorizar

- Regla del tres: la tercera duplicacion se extrae; la segunda se tolera.
- Al tocar codigo vecino para una feature, mejora lo que ya estas tocando; no abras refactors adyacentes "de paso".
- Tras tests en verde y antes de extender logica acoplada: primero deja la pieza trabajable.
- Nunca refactorices: durante un bugfix apurado, en spike de exploracion, ni codigo vendido (`impeccable`, librerias de terceros).

## Reglas de seguridad del refactor

- Comportamiento identico: mismo contrato, mismos resultados; tests en verde antes y despues (skill `testing`).
- Un smell a la vez; cambio pequeno, test, commit. Nada de "ya que estoy, cambio esto otro" (skill `workflow`).
- El refactor y la feature nunca viajan en el mismo commit.

## Patrones frecuentes

- Extract: metodo/funcion/clase/variable para nombrar bloques opacos.
- Rename: nombres que digan el dominio, no la implementacion.
- Move: logica a su capa correcta (skill `arquitectura`).
- Replace: condicionales complejos por polimorfismo/tablas de decision cuando SRP lo pida.
- Introduce parameter object cuando los argumentos se repiten en grupos.

## Deuda tecnica

- Deuda consciente y puntual se registra (TODO con contexto o issue), nunca se oculta; sin TODO sin explicacion.
- Deuda sistemica (patron roto en todo el repo) no se arregla inline: se planifica con `plan` y se ejecuta con el agente `quality`.
- Antes de cerrar, reporta: que cambio, que test lo protege, y deuda restante con severidad.
