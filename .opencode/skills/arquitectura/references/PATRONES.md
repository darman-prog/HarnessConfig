# Patrones de diseno: ubicacion y limite

Carga esta referencia cuando el modulo sea complejo o cuando debas elegir un patron. El criterio manda sobre el catalogo: un patron sin nombre del problema ni 2-3 instancias reales es sobre-ingenieria (`criterio-producto`).

## Tabla de ubicacion

| Patron | Donde vive | Cuando SI | Cuando NO |
| --- | --- | --- | --- |
| Factory | `domain`/`application` | crear entidades o agregados con invariantes | DTOs, o cuando solo hay un constructor |
| Builder | `application`/`adapters` | ensembles inmutables con 3+ opcionales que hay que validar | 2-3 campos (constructor o named args), o cuando `contratos-api` ya fija el schema |
| Specification | `domain` | reglas de negocio compuestas y reutilizables | una sola condicion (metodo o value object) |
| Strategy | `domain`/`application` | algoritmos intercambiables por un puerto (precio, impuestos, transportadora) | un `if` de dos ramas |
| Singleton | `infrastructure`/`core` | instancia unica sin estado mutable, creada por el composition root | el dominio; estado global compartido entre tests (en frontend ver `convenciones-frontend`) |
| Prototype | cualquiera | clonado polimorfico cuando el clon conoce su clase | clonar agregados con identidad; en TS/Python casi nunca hace falta (spread, `replace`, `deepcopy`) |
| Pool | `infrastructure` | recurso escaso y caro de crear (conexiones DB, sockets, clientes HTTP) | recursos baratos; el pool del framework ya lo resuelve |
| Proxy | `infrastructure`/`application` | controlar acceso a un recurso remoto o caro (cache, lazy, permisos, circuit breaker) | el problema es de concurrencia o de despliegue, no de acceso |

## Modulo complejo: cuando proponer un patron

Senales (2 o mas) en un mismo modulo: I/O + estado compartido + recurso escaso + coste por uso + multi-tenant + 2+ integraciones externas.

- Con 2+ senales: **propone** el patron con su porque y espera OK del usuario antes de escribirlo. No lo apliques por defecto.
- Con <2 senales o sin ganancia clara: no hay patron; keep KISS y anota la razon.
- Al cerrar, si el modulo quedo complejo y sin patron, dejalo como deuda tecnica registrada (no como refactor oculto).

## Dueño de cada territorio (no duplicar)

- Entre servicios (Circuit Breaker, Retry con backoff, Outbox, Saga, CQRS, idempotencia): `microservicios`.
- Convenciones de codigo backend (timeouts, transacciones, estructura de carpetas): `convenciones-backend`.
- DTOs y formas del contrato: `contratos-api`. Rate limiting: `seguridad`. Test doubles: `testing`. Smells: `code-quality`.

## Ejemplos (criterio agnostico de lenguaje)

### Pool (Python) — recurso escaso y caro

```python
# SI: cada request abria una conexion nueva (pool explicito del framework)
pool = await asyncpg.create_pool(dsn, min_size=2, max_size=10)

async def fetch_user(pool, user_id):
    async with pool.acquire() as conn:          # el acquire es el pool en accion
        return await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)

# NO: abrir conexion por llamada (sin pool) ni pool global en el dominio
```

El `with pool.acquire()` es el limite de vida del recurso; el pool vive en `infrastructure` y se inyecta en `application` (puerto), nunca se crea en el dominio.

### Proxy (TypeScript) — controlar acceso a un recurso caro o remoto

```ts
// SI: cada lectura del cliente remoto es un round-trip (cache + permiso + traceId)
export function clienteConCache(base: ClientePagos, ttlMs = 60_000) {
  const cache = new Map<string, { dato: Recibo; expira: number }>();
  return {
    async recibo(id: string) {
      const hit = cache.get(id);
      if (hit && hit.expira > Date.now()) return hit.dato;   // cache-hit
      const dato = await base.recibo(id);                      // delega al real
      cache.set(id, { dato, expira: Date.now() + ttlMs });
      return dato;
    },
  };
}
```

El proxy no es "el cliente": envuelve al puerto y vive en `application` (o `infrastructure` si cachea en disco). El puerto (`base: ClientePagos`) es lo que lo hace testeable: los tests usan un stub, no una red.
