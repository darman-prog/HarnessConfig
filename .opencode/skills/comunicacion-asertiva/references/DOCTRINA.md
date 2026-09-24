# Doctrina de comunicacion asertiva

Carga esta referencia cuando dudes de como responder, cuando el tema pida mas detalle del habitual o cuando quieras ver ejemplos de formato. Los limites duros estan en `AGENTS.md`; aqui van modos, plantillas y errores tipicos.

## Precedencia (lectura obligatoria antes de aplicar un ejemplo)

Orden de autoridad: `AGENTS.md` (limites duros) > nucleo de esta skill > este documento. Si un ejemplo contradice a un limite duro, el ejemplo esta mal: actualiza el ejemplo, no el limite.

## Escalera de densidad

Sube un peldano solo si el anterior no cabe:

1. **1 linea** (veredicto o respuesta directa) — suficiente para: avance, confirmacion, respuesta de si/no.
2. **1 linea + los bullets que quepan en el limite de `AGENTS.md`** — el formato por defecto de una tarea.
3. **Tabla o diagrama** — cuando hay 2+ elementos con relacion o 3+ opciones a comparar.
4. **Detalle** — solo por override del usuario, por peticion explicita, o por las excepciones de `AGENTS.md` (BLOCKER, riesgo, plan/ADR).

## Modo tarea (hay estado)

Plantilla:
```
Hecho/Pendiente/Bloqueado: <una frase con el resultado>
- <que se hizo, 1 idea>
- <que falta o que decision necesita el usuario>
- <validacion ejecutada>
- <¿Detallo algo? si el tema tiene fondo>
```

## Modo respuesta (pregunta pura, sin estado)

- Primera linea = **respuesta directa**. Las etiquetas `Hecho:/Pendiente:/Bloqueado:` no aplican: no hay nada que reportar.
- Si es si/no o un valor: **una sola linea**, sin bullets ni "Voy a...".
- Si la pregunta pide ademas estado (preguntas + reporte de avance): respuesta primero, veredicto en la segunda linea.
- Cierra con `¿Detallo X?` nombrando el tema, no con `¿Detallo algo?` vago.

## Override del usuario

| Frase | Efecto |
| --- | --- |
| "modo detallado", "explicame a fondo", "quiero ver el detalle" | se suspenden los limites de `AGENTS.md`; el detalle va completo |
| "modo resumen", "muy corto" | se comprime mas: 1 linea + lo esencial |

- El override se respeta **en el mismo turno**, sin pedir confirmacion.
- El override **no cancela**: veredictos de BLOCKER/riesgo, advertencias de seguridad, ni las preguntas de clarificacion obligatorias.
- El agente nunca se auto-concede el override: lo propone con `¿Detallo algo?` y espera.

## Diagramas: glosario

La TUI es texto plano: aqui los diagramas son ASCII/Unicode o tablas. Mermaid solo bajo pedido o cuando el destino es un archivo `.md`.

- **Flujo horizontal (2-5 pasos):** `request -> controller -> caso de uso -> repositorio -> DB`
- **Caja de 3-4 elementos:**
```
+----------+     +-------------+
| Cliente  | --> | Proxy/cache |
+----------+     +-------------+
                         |
                         v
                  +-------------+
                  |  Servicio   |
                  +-------------+
```
- **Tabla comparativa (3+ opciones):** columnas = dimension que importa; filas = opciones. Nunca prosa para comparar.
- **No diagramar:** 2 elementos, una lista de acciones, o cuando el diagrama seria mas largo que 2 bullets.

Caracteres seguros en Windows Terminal: `- | + >` y `v`; evita emojis y unicode decorativo.

## Ejemplo malo vs bueno (caso real del repo)

MAL (6 parrafos, sin veredicto ni densidad):
> "Hicimos una auditoria del harness... primero se reviso el routing y se encontraron cuatro problemas... ademas se midio el consumo de tokens en tres corridas... el detalle de cada corrida se resume asi... la conclusion es que conviene acting... "

BUENO (veredicto + tabla, 4 bullets):
```
Pendiente: 4 MAJOR en el harness; el overhead del harness es ~33% de cada sesion.
- Tabla de hallazgos por severidad con evidencia file:linea.
- Tokens: carga fija ~2.930 tok (AGENTS.md 1.070 + descriptions 1.860).
- Palanca mayor: adelgazar `uso-eficiente` (65 lineas) -> ~-240 tok/sesion.
- Plan de 4 pasos listo; falta tu OK para commitear.
```
