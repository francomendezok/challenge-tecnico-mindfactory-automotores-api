# API registro de automotores

Challenge técnico Mindfactory. Stack: **NestJS**, **TypeORM**, **Postgres**. Modelo con sujetos (titulares), objetos de valor, automotores y vínculos; validaciones de dominio argentino, CUIT y fecha de fabricación tipo `YYYYMM`.

El esquema está en `docs/schema.sql`. El porqué de algunas decisiones en: `docs/DECISION_LOG.md`.

---

## Levantar todo con Docker

Desde la raíz del repo:

```bash
docker compose up -d --build
docker compose ps
```

Cuando `automotores-db` y `automotores-api` digan **healthy**, la API queda en **http://localhost:3000**. Postgres del host: **localhost:5433** (el 5432 en mi máquina ya lo tenía ocupado, por eso el mapeo así).

Si el `GET /api/automotores` da `[]` pero en la base ves filas, casi seguro es imagen vieja de la API. Debemos hacer:

```bash
docker compose build api && docker compose up -d api
```

---

## Seed de prueba (opcional)

Para no dar de alta todo a mano con POST:

```bash
docker compose exec -T db psql -U postgres -d automotores -f - < docs/mock.sql
```

Ahí vienen 3 dominios (`ABC123`, `AB12CDE`, `AAF555`) y CUITs que pasan el validador. El detalle está comentado dentro del mismo archivo.

---

## Solo Nest en la máquina (sin contenedor de la API)

Necesitás Postgres accesible y un `.env`:

```bash
cp .env.example .env
npm install
npm run start:dev
```
---

## Tests

Todo vive bajo **`test/`**:

| Carpeta / config | Qué es |
|------------------|--------|
| `test/unit/**/*.spec.ts` | Validadores (dominio, CUIT, fecha). No tocan red ni DB. |
| `test/e2e/*.e2e-spec.ts` | HTTP real contra la app: health sin DB, y API completa con TypeORM. |
| `test/jest-unit.json` / `test/jest-e2e.json` | Config de Jest (el e2e usa `setup-e2e.ts` para cargar `.env`). |
| `test/helpers/` | Cómo levantar la app igual que `main.ts` y el `TRUNCATE` entre casos. |

```bash
npm run test        # unitarios solos
npm run test:e2e    # necesita Postgres levantado (mismo .env: DATABASE_HOST=localhost, DATABASE_PORT=5433 si usás docker compose db)
```

Por defecto los e2e de la API hacen **`TRUNCATE ... CASCADE`** antes de cada caso para que sean determinísticos.

**Sin borrar tus datos:** en `.env` poné **`E2E_SKIP_TRUNCATE=true`** (o `1`). Ahí no se trunca nada. Consecuencia: si ya existen los CUIT que usan los tests (`20123456786`, `27302878485`) o dominios que chocan, **algunos tests pueden fallar**. Para CI o resultado confiable, no uses skip.


## Endpoints / curls

Base: `http://localhost:3000`.

- Negocio bajo **`/api`**
- **`/health`** está afuera del prefijo (sirve para el healthcheck del contenedor)

### Health

```bash
curl -s http://localhost:3000/health
```

Debería responder `{"status":"ok"}`.

### Automotores

Listado:

```bash
curl -s http://localhost:3000/api/automotores
```

Por dominio (ej. si corriste el mock):

```bash
curl -s http://localhost:3000/api/automotores/ABC123
```

Alta — el **CUIT tiene que existir** como sujeto antes:

```bash
curl -s -X POST http://localhost:3000/api/automotores \
  -H "Content-Type: application/json" \
  -d '{
    "dominio":"ZZZ999",
    "cuit":"20123456786",
    "numeroChasis":"CH-001",
    "numeroMotor":"MOT-001",
    "color":"Blanco",
    "fechaFabricacion":202201
  }'
```

Cambiá `ZZZ999` si ya lo usaste una vez.

Actualizar (el body es todo opcional):

```bash
curl -s -X PUT http://localhost:3000/api/automotores/ZZZ999 \
  -H "Content-Type: application/json" \
  -d '{"color":"Gris"}'
```

Cambiar titular del automotor (`PUT` en **automotores**, no en sujetos). El CUIT nuevo tiene que existir en `Sujeto` (mock o `POST /api/sujetos`):

```bash
# Con sujeto ya cargado en mock.sql (María Elena):
curl -s -X PUT http://localhost:3000/api/automotores/ZZZ999 \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27302878485"}'

# O con el sujeto que diste de alta abajo (Pepe, CUIT 27345678900):
curl -s -X PUT http://localhost:3000/api/automotores/ZZZ999 \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27345678900"}'
```

Borrar (204 sin body si salió bien):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:3000/api/automotores/ZZZ999
```

### Sujetos

Alta:

```bash
curl -s -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{"cuit":"20429783977","denominacion":"Transportes Pampeanos S.A."}'
```

Si corriste `mock.sql`, este CUIT ya existe → **422** (`El CUIT ya está registrado`):

```bash
curl -s -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27302878485","denominacion":"María Elena Fernández"}'
```

Otro titular para probar el `PUT` de reasignación (CUIT válido módulo 11, no está en el mock):

```bash
curl -s -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27345678900","denominacion":"Pepe Juarez"}'
```

Después podés reasignar un automotor a Pepe con el segundo `PUT` de la sección Automotores (`"cuit":"27345678900"`).

Buscar por CUIT:

```bash
curl -s http://localhost:3000/api/sujetos/by-cuit/20123456786
curl -s http://localhost:3000/api/sujetos/by-cuit/20-12345678-6
```

### Errores

| Código | Cuándo |
|--------|--------|
| 404 | dominio o sujeto que no está |
| 422 | validación (dominio/CUIT/fecha) o regla de negocio (titular inexistente, dominio duplicado, etc.) |


## Build / prod local

```bash
npm run build
npm run start:prod
```

Eso corre `node dist/main.js`.

---