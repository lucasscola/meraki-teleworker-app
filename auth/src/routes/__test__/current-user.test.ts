import request from 'supertest';
import { app } from '../../app';

// Get user details test
it('Returns details of signed user', async () => {
    // Signup first - signin function may as well be defined in its own file and imported here
    const cookie = await global.signin();

    const response =  await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

    expect(response.body.user.email).toEqual('test@test.com');

});

// Response null if not authenticated test
it('Returns empty response because user is not logged into the application', async () => {
    const response =  await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
    
    expect(response.body.user).toEqual(null);

});
