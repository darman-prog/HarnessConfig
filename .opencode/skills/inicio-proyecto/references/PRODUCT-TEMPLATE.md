# Template PRODUCT.md

Usa esta estructura para generar el `PRODUCT.md` del proyecto, reemplazando los placeholders con las respuestas del usuario.

```markdown
# {Nombre del proyecto}

## Problema / Necesidad

{Descripcion del problema que resuelve. 2-4 frases. Que dolor ataca y para quien.}

## Usuarios objetivo

{Perfil del usuario. Quien usa esto, en que contexto, que nivel tecnico tiene.}

## Propuesta de valor

{Que hace diferente a este proyecto. 1-2 frases. El "por que esta solucion y no otra".}

## MVP (Producto Minimo Viable)

### Incluido en MVP
- {Feature 1}
- {Feature 2}
- {Feature 3}

### Excluido del MVP (futuros hitos)
- {Feature A} — motivo: {prioridad baja/requiere X/no valida la hipotesis principal}
- {Feature B} — motivo: {...}

## Hipotesis a validar

1. {Hipotesis principal: que creemos que es verdad y queremos probar}
2. {Hipotesis secundaria}

## Metricas de exito del MVP

- {Metrica observable: "X conversiones en Y dias", "tiempo de tarea < Z seg", etc.}

## Restricciones confirmadas

- Stack: {frontend} + {backend}
- Base de datos: {BD}
- Testing: {framework}
- Presupuesto/tiempo si aplica: {...}

## Supuestos pendientes de validar

- {Supuesto 1}
- {Supuesto 2}

## Decisiones pendientes

| Opcion A | Opcion B | Recomendacion | Pendiente de |
| --- | --- | --- | --- |
| {...} | {...} | {...} | {quien decide} |
```

## Notas

- Si el proyecto no tiene hipotesis claras, marca la seccion como "Pendiente: definir en v1.1" y no la dejes vacia.
- Manten el MVP pequeno (max 5 features incluidas). Si hay mas, mueve a "Excluido del MVP".
