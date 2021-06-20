import request from 'supertest';
import { app } from '../../app';

// Valid signin test
it('Returns a 200 and cookie on successful signin', async () => {
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
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'password'
    })
    .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined;
});

// Invalid password test
it('Returns a 401 because of invalid password', async () => {
    // Signup first
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password',
        group: 'test'
    })
    .expect(201);
    
    await request(app)
    .post('/api/users/signin')
    .send({
        email: 'test@test.com',
        password: 'p'
    })
    .expect(400);
});