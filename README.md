<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API: probar con Docker y `curl`

La base URL por defecto es **`http://localhost:3000`**. Las rutas de negocio van bajo **`/api`**; el **healthcheck** queda en **`/health`** (sin prefijo).

### 1. Levantar la API y Postgres

En la raíz del repo:

```bash
docker compose up -d --build
docker compose ps
```

Esperá a que `automotores-db` y `automotores-api` estén **healthy**. La API escucha en el puerto **3000** y Postgres del host en **5433** (mapeado desde el contenedor).

### 2. (Opcional) Cargar datos de ejemplo

Si querés autos y titulares sin usar solo POST:

```bash
docker compose exec -T db psql -U postgres -d automotores -f - < docs/mock.sql
```

Detalle de los datos: `docs/mock.sql`.

### 3. Desarrollo local sin Docker (solo Nest)

```bash
cp .env.example .env
# Asegurate de DATABASE_PORT=5433 si Postgres corre en Docker y exponés 5433 al host
npm install
npm run start:dev
```

### 4. Endpoints y comandos `curl`

**Health (liveness)**

```bash
curl -s http://localhost:3000/health
```

Respuesta esperada: `{"status":"ok"}`.

---

**Listado de automotores**

```bash
curl -s http://localhost:3000/api/automotores
```

---

**Un automotor por dominio** (ejemplo: `ABC123` si cargaste el mock)

```bash
curl -s http://localhost:3000/api/automotores/ABC123
```

---

**Alta de sujeto** (titular; debe existir antes del POST del automotor con ese CUIT)

```bash
curl -s -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{"cuit":"20123456786","denominacion":"Transportes Pampeanos S.A."}'
```

Segundo titular (útil para probar reasignación con PUT):

```bash
curl -s -X POST http://localhost:3000/api/sujetos \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27302878485","denominacion":"María Elena Fernández"}'
```

---

**Buscar sujeto por CUIT**

```bash
curl -s http://localhost:3000/api/sujetos/by-cuit/20123456786
```

Con guiones en la URL:

```bash
curl -s http://localhost:3000/api/sujetos/by-cuit/20-12345678-6
```

---

**Alta de automotor** (`dominio` formato `AAA999` o `AA999AA`; `fechaFabricacion` = entero `YYYYMM`)

Usá un dominio que no exista aún (ajustá `ZZZ999` si ya fue dado de alta):

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

---

**Actualizar automotor** (todos los campos del body son opcionales)

Solo color:

```bash
curl -s -X PUT http://localhost:3000/api/automotores/ZZZ999 \
  -H "Content-Type: application/json" \
  -d '{"color":"Gris"}'
```

Cambiar titular (el nuevo CUIT debe existir como sujeto):

```bash
curl -s -X PUT http://localhost:3000/api/automotores/ZZZ999 \
  -H "Content-Type: application/json" \
  -d '{"cuit":"27302878485"}'
```

---

**Baja de automotor** (cascada sobre objeto de valor y vínculos)

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X DELETE http://localhost:3000/api/automotores/ZZZ999
```

Esperado: código **204**.

---

**Ver código HTTP en cualquier llamada**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/api/automotores
```

### 5. Respuestas y errores habituales

- **200 / 201 / 204**: éxito según método.
- **404**: dominio o CUIT inexistente.
- **422**: validación de negocio o de DTO (dominio/CUIT/fecha inválidos, CUIT de titular inexistente al crear automotor, etc.).

Si `GET /api/automotores` devuelve `[]` pero en la base hay datos, reconstruí la imagen de la API y volvé a levantar: `docker compose build api && docker compose up -d api`.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
