import request from 'supertest';

import { createTestApp } from './tools';
import userRoutes from '../../../../src/public/api/routers/user.router';

const app = createTestApp();
app.use(userRoutes);


describe('User Router', function() {

    describe('GET /', () => {

        test('should return 401', async () => {

            const response  = await request(app).get('/').set('Accept', 'application/json');
            
            expect(response.status).toBe(401);
        });

    });

});