import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createHealthOnlyTestApp } from '../helpers/create-test-app';

describe('GET /health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createHealthOnlyTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 200 and status ok', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('returns JSON content type', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('is stable on repeated calls', async () => {
    const a = await request(app.getHttpServer()).get('/health').expect(200);
    const b = await request(app.getHttpServer()).get('/health').expect(200);
    expect(a.body).toEqual(b.body);
  });

  it('does not expose health under /api prefix', () => {
    return request(app.getHttpServer()).get('/api/health').expect(404);
  });
});
