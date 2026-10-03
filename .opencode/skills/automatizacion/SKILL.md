---
name: automatizacion
description: Diseña scripts pequeños, repetibles y seguros para tareas rutinarias; incluye vista previa y validación. Usar al automatizar procesos locales o del proyecto.
---

# Automatización segura

Reduce trabajo repetitivo con el mecanismo más simple compatible con el sistema y las convenciones existentes.

- Confirma la entrada, el resultado esperado, el entorno y qué rutas o recursos puede tocar el script.
- Reutiliza herramientas y dependencias ya presentes; no instales paquetes ni servicios sin necesidad y autorización.
- Mantén el alcance acotado. Haz la operación idempotente cuando sea posible y añade `-WhatIf`, dry-run o vista previa para cambios masivos o destructivos.
- Valida entradas, cita rutas y evita ejecutar texto recibido como comando; no incluyas secretos ni datos sensibles en el script o su salida.
- Prueba primero con datos temporales o una muestra; informa el resultado y los efectos antes de aplicar acciones irreversibles.
- Si el script es código nuevo o modificado, aplica `code-clue` a los bloques no obvios.
- No ejecutes borrados, escrituras masivas, publicaciones ni cambios remotos sin confirmar su alcance con el usuario.
