# Decision log

Registro de decisiones técnicas del proyecto.

| Fecha | Decisión | Contexto | Alternativas consideradas |
| ----- | -------- | -------- | ------------------------- |
| 2026-05-15 | Validadores como funciones puras en `common/validators` | Fáciles de testear con Jest sin levantar Nest ni la DB | Validar solo con `class-validator` en DTOs |
| 2026-05-15 | CUIT con módulo 11 y multiplicadores AFIP | Requisito del challenge para dígito verificador | Solo longitud de 11 dígitos |
| 2026-05-15 | Dominio normalizado a mayúsculas antes del regex | Patentes argentinas no distinguen mayúsculas en la práctica | Rechazar minúsculas sin normalizar |
| 2026-05-15 | Fecha fabricación como entero `YYYYMM` inyectando fecha de referencia en tests | Evita tests flaky por mes/año actual | Mockear `Date` global |
| 2026-05-15 | Ramas por feature + Conventional Commits | Criterio de evaluación Git del challenge | Todo en `main` directo |
| 2026-05-15 | Tests unitarios bajo `test/unit` y e2e bajo `test/e2e` | Un solo lugar para Jest; `src/` sin `.spec.ts` | Dejar specs junto al código en `src/` |
| 2026-05-15 | E2e con `TRUNCATE` entre casos; opt-out con `E2E_SKIP_TRUNCATE` | Determinismo en CI; poder correr e2e sin borrar data local (con riesgo de choques) | Base Postgres dedicada solo para tests |
| 2026-05-15 | `moduleNameMapper` en Jest para imports `*.js` (NodeNext) | TypeScript emite paths `.js`; Jest resolvía mal sin el mapper | Volver imports sin extensión en entidades |
| 2026-05-15 | `test/helpers` replica pipes/filtro de `main.ts` | E2e prueba el mismo stack que producción | Levantar proceso real con `child_process` |
| 2026-05-16 | Alta reutiliza `Objeto_De_Valor` por `ovp_codigo` y cierra dueño activo previo | Regla de negocio 1 literal del challenge | Siempre crear objeto nuevo |
