import request from 'supertest';
import { app } from '../../app';


it('returns 200 if getting device', async () => {
    // Create device
    const cookie = global.signin();
    let response = await request(app)
    .post('/api/devices')
    .set('Cookie', cookie)
    .send({
        serialNumber: 'AAAA-AAAA-AAAA',
    });

    // Get device
    response = await request(app)
    .get('/api/devices')
    .set('Cookie', cookie)
    .send({});

    expect(response.status).toEqual(200);
    expect(response.body.serialNumber).toEqual('AAAA-AAAA-AAAA');
});