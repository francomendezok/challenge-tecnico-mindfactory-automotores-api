# API registro de automotores

Challenge técnico Mindfactory. Stack: **NestJS**, **TypeORM**, **Postgres**. Modelo con sujetos (titulares), objetos de valor, automotores y vínculos; validaciones de dominio argentino, CUIT y fecha de fabricación tipo `YYYYMM`.

El esquema está en `docs/schema.sql`. Si te interesa el porqué de algunas decisiones, `docs/DECISION_LOG.md`.

---

## Levantar todo con Docker

Desde la raíz del repo:

```bash
docker compose up -d --build
docker compose ps
```

Cuando `automotores-db` y `automotores-api` digan **healthy**, la API queda en **http://localhost:3000**. Postgres del host: **localhost:5433** (el 5432 en mi máquina ya lo tenía ocupado, por eso el mapeo así).

Si el `GET /api/automotores` te da `[]` pero en la base ves filas, casi seguro es imagen vieja de la API. A mí me pasó:

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

Importante: Nest **no lee `.env` solo**; en `main` se carga con `dotenv` antes de levantar los módulos. Si `DATABASE_PORT` no entra, TypeORM cae al default **5432** y vos podés estar mirando otra base que la de Docker en **5433** — por eso parecía vacío todo.

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
npm run test:e2e    # necesita Postgres levantado (mismo .env que usás con npm: DATABASE_HOST=localhost, DATABASE_PORT=5433 si usás docker compose db)
```

Los e2e de la API **vacían las tablas** antes de cada test (`TRUNCATE ... CASCADE`). No los corras contra una base donde tengas data que quieras conservar.

**¿Cubrimos todos los edge cases?** No. Cubrimos caminos felices, 404/422 obvios, duplicados, body con campo de más, y un par de cosas de dominio/CUIT/fecha en unitarios. Falta, por ejemplo: concurrencia, timeouts de DB, todos los tipos de CUIT, stress, y e2e con Postgres distinto al default. Si sumás eso, son más tests o herramientas tipo Testcontainers.


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

Cambiar titular (el nuevo CUIT tiene que estar dado de alta como sujeto):

```bash
curl -s -X PUT http://localhost:3000/api/automotores/ZZZ999 \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27302878485"}'
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
  -d '{"cuit":"20123456786","denominacion":"Transportes Pampeanos S.A."}'
```

Otro CUIT para jugar con el PUT de reasignación:

```bash
curl -s -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27302878485","denominacion":"María Elena Fernández"}'
```

Buscar por CUIT:

```bash
curl -s http://localhost:3000/api/sujetos/by-cuit/20123456786
curl -s http://localhost:3000/api/sujetos/by-cuit/20-12345678-6
```

### Códigos que me importan

| Código | Cuándo |
|--------|--------|
| 404 | dominio o sujeto que no está |
| 422 | validación (dominio/CUIT/fecha) o regla de negocio (titular inexistente, dominio duplicado, etc.) |

Para ver el status sin imprimir el body:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/automotores
```

---

## Build / prod local

```bash
npm run build
npm run start:prod
```

Eso corre `node dist/main.js`.

---

Nest arranca con el CLI default; la doc pesada del starter la saqué porque no aportaba acá. Si necesitás algo del ecosistema Nest, [docs.nestjs.com](https://docs.nestjs.com).
