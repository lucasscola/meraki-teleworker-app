import request from 'supertest';
import { app } from '../../app';

// Test valid signout
it('Returns a destroyed cookie after succesful signout', async () => {
    // Signup first
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password',
        group: 'test'
    })
    .expect(201);
    
    const response =  await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);
    expect(response.get('Set-Cookie')).toBeDefined;
});
