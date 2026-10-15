# Feature-spec (DDR): una por feature

Fuente de verdad para cambios que duran >1 sesion o tocan >=2 agentes: se planea, se ejecuta y se cierra desde aqui.
Se persiste en `docs/features/NNN-<slug>.md`. Cambios pequenos: changelog, sin spec.

```markdown
---
id: NNN
status: borrador          # borrador | aprobada | en-curso | cerrada
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
# Feature NNN — nombre funcional claro

> Resumen ejecutivo: qué cambia y por qué importa, en dos líneas.

## Objetivo
Resultado observable en lenguaje de usuario.

## Contexto
Antecedente mínimo necesario para entender la decisión.

## Alcance
| Incluye | Excluye |
|---|---|
| Cambio principal | Lo que no se toca |

## Criterios de aceptación
| N.º | Criterio verificable | Evidencia |
|---|---|---|
| 1 | Comando o condición exacta | `file:línea`, salida o commit |

## Pasos
Un paso por commit, con su validación incluida.

## Cierre
- Fila resumen del changelog.
- ADR solamente si hubo una decisión difícil de revertir.
```
## Ciclo de vida

- `plan` la redacta en su entrega (no edita); el ejecutor persiste el archivo con `status: en-curso` al arrancar el paso 1.
- La spec manda mientras `status` != `cerrada`: tras compactar contexto, se reanuda leyendo solo este archivo.
- Al cerrar: `calidad-cierre` verifica criterio a criterio contra la sección Evidencia; el changelog queda como registro historico.
- Spec `cerrada` no se reescribe: una decision nueva abre otra feature o un ADR.