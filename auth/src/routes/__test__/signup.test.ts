import request from 'supertest';
import { app } from '../../app';

// Valid signup test
it('Returns a 201 on successful signup', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password',
        group: 'test'
    })
    .expect(201);
});

// Invalid email test
it('Returns a 400 because of invalid email', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'invalidEmail',
        password: 'password',
        group: 'test'
    })
    .expect(400);
});

// Invalid password test
it('Returns a 400 because of invalid password', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'p',
        group: 'test'
    })
    .expect(400);
});

// Missing parameters test
it('Returns a 400 because of missing email, password and group', async () => {
    return request(app)
    .post('/api/users/signup')
    .send({})
    .expect(400);
});

// Unique email test
it('Disallow duplicate email', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password',
        group: 'test'
    })
    .expect(201);

    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password',
        group: 'test'
    })
    .expect(400);
});

// Receive cookie after signup test
it('Sets a cookie after successful signup', async () => {
    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: 'password',
        group: 'test'
    })
    .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined;
});