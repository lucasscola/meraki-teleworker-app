import request from 'supertest';
import { app } from '../../app';

it('returns 404 if device is not found', async () => {
    const response = await request(app)
    .get(`/api/devices/details`)
    .set('Cookie', global.signin())
    .send({
        serialNumber: 'AAAA-AAAA-AAAA'
    });

    expect(response.status).toEqual(404);
});

it.todo('returns device details');