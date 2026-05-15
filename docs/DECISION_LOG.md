# Decision log

Registro de decisiones técnicas del proyecto.

| Fecha | Decisión | Contexto | Alternativas consideradas |
| ----- | -------- | -------- | ------------------------- |
| 2026-05-15 | Validadores como funciones puras en `common/validators` | Fáciles de testear con Jest sin levantar Nest ni la DB | Validar solo con `class-validator` en DTOs |
| 2026-05-15 | CUIT con módulo 11 y multiplicadores AFIP | Requisito del challenge para dígito verificador | Solo longitud de 11 dígitos |
| 2026-05-15 | Dominio normalizado a mayúsculas antes del regex | Patentes argentinas no distinguen mayúsculas en la práctica | Rechazar minúsculas sin normalizar |
| 2026-05-15 | Fecha fabricación como entero `YYYYMM` inyectando fecha de referencia en tests | Evita tests flaky por mes/año actual | Mockear `Date` global |
| 2026-05-15 | Ramas por feature + Conventional Commits | Criterio de evaluación Git (10 pts) | Todo en `main` directo |
