# Template INDEX.md (cerebro documental)

Genera el `INDEX.md` con esta estructura. Maximo ~60 lineas: es el unico documento
que se carga SIEMPRE; si crece, el ahorro de tokens del cerebro se pierde.

```markdown
---
status: vigente
last_reviewed: 2026-09-18
---

# Contexto del proyecto — {Nombre}

Fuente de verdad organizada del proyecto. Carga solo los documentos relevantes a la
tarea; nunca todo el directorio.

## Documentos

| Doc | Contenido | Cargar cuando | Estado |
| --- | --- | --- | --- |
| [PRODUCT.md](PRODUCT.md) | Problema, usuarios, MVP, hipotesis | producto, alcance, prioridades | vigente |
| [DESIGN.md](DESIGN.md) | Direccion visual, tokens, estados | UI, componentes, estilos | vigente |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Capas, limites, patrones | arquitectura, modulo nuevo | vigente |
| [DOMAIN.md](DOMAIN.md) | Reglas de negocio, entidades, vocabulario | logica de negocio | vigente |
| [API.md](API.md) | Endpoints, contratos, errores | endpoints, DTOs, integraciones | vigente |
| [DATA.md](DATA.md) | Esquema, migraciones, indices | esquema, queries, migraciones | vigente |
| [SECURITY.md](SECURITY.md) | Auth, permisos, datos sensibles | auth, permisos, secretos | vigente |
| [TESTING.md](TESTING.md) | Estrategia, suites, comandos | tests, cobertura | vigente |
| [OPERATIONS.md](OPERATIONS.md) | Deploy, ambientes, runbooks | deploy, infra, incidentes | pendiente |
| [DECISIONS/](DECISIONS/) | ADRs numerados | decisiones de arquitectura | vigente |
| [FLOWS/](FLOWS/) | Flujos de usuario paso a paso | bugs de flujo, nuevas features de flujo | vigente |

Docs raiz enlazados: [PRODUCT.md](../../PRODUCT.md) · [DESIGN.md](../../DESIGN.md)
(eliminar esta linea si viven dentro del cerebro)

## Reglas del cerebro

- Actualizacion solo tras cambio verificado (calidad-cierre), nunca por edicion.
- Solo se actualizan los documentos afectados por el cambio.
- Datos sin evidencia llevan `confidence: supuesto` y `status: pendiente`.
- Contradiccion doc/codigo: reportar, no corregir automaticamente.
- Este indice se mantiene <= 60 lineas; si crece, resumir filas.
```

## Notas de generacion

- Deja fuera de la tabla los documentos que no existan; agregalos cuando nazcan.
- La columna "Cargar cuando" usa las senales de la tabla del Skill Gate de AGENTS.md
  para que el enrutamiento sea consistente.
- Si el proyecto es pequeno, fusiona documentos con permiso del usuario (ej. DATA y
  API) y dejalo registrado en este indice.
