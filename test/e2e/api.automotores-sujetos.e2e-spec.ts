import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createFullTestApp } from '../helpers/create-test-app';
import { truncateAllPublicTables } from '../helpers/truncate-test-tables';

describe('API automotores y sujetos (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const cuitTitular = '20123456786';
  const cuitOtro = '27302878485';
  const uniqueDom = () => {
    const n = (Date.now() % 900) + 100;
    return `AB${String(n).padStart(3, '0')}CD`;
  };

  beforeAll(async () => {
    app = await createFullTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAllPublicTables(dataSource);
  });

  describe('POST /api/sujetos', () => {
    it('crea sujeto con CUIT válido', () => {
      return request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'ACME SRL' })
        .expect(201)
        .expect((res) => {
          expect(res.body.cuit).toBe(cuitTitular);
          expect(res.body.denominacion).toBe('ACME SRL');
        });
    });

    it('422 si el CUIT ya existe', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'Uno' })
        .expect(201);
      return request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'Duplicado' })
        .expect(422);
    });

    it('422 si el CUIT no pasa verificación', () => {
      return request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: '20123456780', denominacion: 'Mal verificador' })
        .expect(422);
    });
  });

  describe('GET /api/sujetos/by-cuit/:cuit', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'Para buscar' })
        .expect(201);
    });

    it('200 cuando existe', () => {
      return request(app.getHttpServer()).get(`/api/sujetos/by-cuit/${cuitTitular}`).expect(200);
    });

    it('404 cuando no hay sujeto', () => {
      return request(app.getHttpServer()).get('/api/sujetos/by-cuit/27222333445').expect(404);
    });

    it('422 CUIT inválido', () => {
      return request(app.getHttpServer()).get('/api/sujetos/by-cuit/123').expect(422);
    });
  });

  describe('GET /api/automotores', () => {
    it('lista vacía sin datos', () => {
      return request(app.getHttpServer())
        .get('/api/automotores')
        .expect(200)
        .expect([]);
    });

    it('lista con un automotor después del alta', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({
          dominio: dom,
          cuit: cuitTitular,
          fechaFabricacion: 202201,
        })
        .expect(201);
      const res = await request(app.getHttpServer()).get('/api/automotores').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].dominio).toBe(dom);
      expect(res.body[0].duenoActual?.cuit).toBe(cuitTitular);
    });

    it('respuesta es array JSON', async () => {
      const res = await request(app.getHttpServer()).get('/api/automotores').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/automotores/:dominio', () => {
    it('404 si no existe', () => {
      return request(app.getHttpServer()).get('/api/automotores/NOTHERE').expect(404);
    });

    it('200 con detalle y dueño', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(201);
      const res = await request(app.getHttpServer()).get(`/api/automotores/${dom}`).expect(200);
      expect(res.body.dominio).toBe(dom);
      expect(res.body.duenoActual?.cuit).toBe(cuitTitular);
    });

    it('normaliza dominio en la URL a mayúsculas', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(201);
      return request(app.getHttpServer()).get(`/api/automotores/${dom.toLowerCase()}`).expect(200);
    });
  });

  describe('POST /api/automotores', () => {
    it('422 si el titular no existe', () => {
      const dom = uniqueDom();
      return request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(422);
    });

    it('201 crea automotor y asigna dueño', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      return request(app.getHttpServer())
        .post('/api/automotores')
        .send({
          dominio: dom,
          cuit: cuitTitular,
          color: 'Rojo',
          fechaFabricacion: 202201,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.dominio).toBe(dom);
          expect(res.body.color).toBe('Rojo');
        });
    });

    it('422 dominio duplicado', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitOtro, denominacion: 'Otro' })
        .expect(201);
      return request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitOtro, fechaFabricacion: 202202 })
        .expect(422);
    });
  });

  describe('PUT /api/automotores/:dominio', () => {
    it('404 dominio inexistente', () => {
      return request(app.getHttpServer())
        .put('/api/automotores/ZZZ404')
        .send({ color: 'Azul' })
        .expect(404);
    });

    it('200 actualiza color', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201, color: 'Blanco' })
        .expect(201);
      const res = await request(app.getHttpServer())
        .put(`/api/automotores/${dom}`)
        .send({ color: 'Negro' })
        .expect(200);
      expect(res.body.color).toBe('Negro');
    });

    it('200 reasigna titular', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitOtro, denominacion: 'Otro' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(201);
      const res = await request(app.getHttpServer())
        .put(`/api/automotores/${dom}`)
        .send({ cuit: cuitOtro })
        .expect(200);
      expect(res.body.duenoActual?.cuit).toBe(cuitOtro);
    });
  });

  describe('DELETE /api/automotores/:dominio', () => {
    it('404 si no existe', () => {
      return request(app.getHttpServer()).delete('/api/automotores/NO999').expect(404);
    });

    it('204 borra y luego 404 al consultar', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(201);
      await request(app.getHttpServer()).delete(`/api/automotores/${dom}`).expect(204);
      return request(app.getHttpServer()).get(`/api/automotores/${dom}`).expect(404);
    });

    it('segundo delete devuelve 404', async () => {
      await request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular, denominacion: 'T' })
        .expect(201);
      const dom = uniqueDom();
      await request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: dom, cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(201);
      await request(app.getHttpServer()).delete(`/api/automotores/${dom}`).expect(204);
      await request(app.getHttpServer()).delete(`/api/automotores/${dom}`).expect(404);
    });
  });

  describe('Validaciones 422 (DTO / negocio)', () => {
    it('POST automotor con dominio inválido', () => {
      return request(app.getHttpServer())
        .post('/api/automotores')
        .send({ dominio: 'BAD', cuit: cuitTitular, fechaFabricacion: 202201 })
        .expect(422);
    });

    it('POST automotor con propiedad no permitida en body', () => {
      return request(app.getHttpServer())
        .post('/api/automotores')
        .send({
          dominio: 'ABC999',
          cuit: cuitTitular,
          fechaFabricacion: 202201,
          extraField: 1,
        })
        .expect(422);
    });

    it('POST sujeto sin denominación', () => {
      return request(app.getHttpServer())
        .post('/api/sujetos')
        .send({ cuit: cuitTitular })
        .expect(422);
    });
  });
});
