# Reglas de actualizacion del cerebro — casos detallados

Complementa la seccion "Actualizacion" de SKILL.md con casos que suelen dudarse.

## Cuando NO actualizar

- Refactor sin cambio de comportamiento: no toca DOMAIN/API/DATA. Si cambio un limite
  de capas, si toca ARCHITECTURE.md.
- Fix de bug cuyo flujo documentado sigue siendo correcto: no hay cambio de
  conocimiento. Si el bug revelo que el flujo documentado estaba mal, actualiza el
  FLOWS/ o DOMAIN.md correspondiente y cita el bugfix como `source`.
- Cambio de dependencia sin impacto de contrato: nada, salvo que cambie un comando
  (TESTING.md/OPERATIONS.md) o una integracion (API.md).
- Renombres internos sin cambio de contrato: nada.

## Cuando actualizar SI o SI

- Contrato de API: agregar/modificar/quitar endpoint, DTO o formato de error → API.md
  (y DOMAIN.md si cambia una regla de negocio detrás).
- Migracion con cambio de esquema, indice unico, nulabilidad → DATA.md.
- Decision de arquitectura (nueva capa, patron, dividir servicio) → ADR + ARCHITECTURE.md.
- Cambio de permisos/roles o tratamiento de datos sensibles → SECURITY.md.
- Flujo de usuario con pasos nuevos o reordenados → FLOWS/<flujo>.md.
- Cambio de stack, comandos de dev/build/test → actualizar tambien AGENTS.md (merge,
  skill inicio-proyecto para el formato).

## Ejecucion de la actualizacion

1. Termina y verifica el cambio (tests/lint/validacion manual).
2. Lista los documentos afectados (mapeo de SKILL.md).
3. Edita solo la seccion afectada de cada documento; no reescribas el documento entero.
4. Actualiza frontmatter del doc tocado: `last_reviewed` y `source` (cambio o ADR).
5. Si surgió una decision nueva, crea el ADR ANTES de actualizar el doc y enlazalo.
6. Resume al usuario: documentos actualizados + que cambio en cada uno (1 linea por doc).

## Contradicciones: arbol de decision

```text
¿El codigo contradice un doc del cerebro?
├── Doc confidence: supuesto/inferido
│   → El codigo gana. Actualiza el doc; source = codigo verificado.
├── Doc confidence: confirmado SIN ADR
│   → Verifica con el usuario: ¿el codigo evoluciono sin doc, o es regresion?
│   → No corrijas codigo por tu cuenta.
├── Doc confirmado CON ADR vigente
│   → El ADR gana. Trata el codigo como regresion potencial; reporta BLOCKER.
└── Doc status: obsoleto/pendiente
    → No lo uses como fuente; propon actualizarlo antes de decidir.
```

## Anti-patrones

- Reescribir INDEX.md completo en cada cambio: edita solo la fila afectada.
- Actualizar el cerebro con trabajo a medio hacer (sin tests): esperar a verificado.
- Convertir el cerebro en changelog: registra conocimiento vigente, no historia
  (la historia vive en git y en los ADRs).
- Copiar contenido entre documentos: enlaza; una sola fuente de verdad por dato.
- Dejar `confidence: confirmado` en datos que solo inferiste del codigo: usa
  `inferido` y deja la pregunta abierta en `status: pendiente`.
