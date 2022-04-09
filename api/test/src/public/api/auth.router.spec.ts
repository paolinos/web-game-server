import request from 'supertest';

import { createTestApp } from './tools';
import authRoutes from '../../../../src/public/api/routers/auth.router';

const app = createTestApp();
app.use(authRoutes);


describe('Auth Router', function() {

    describe('GET /', () => {

        test('should return 401', async () => {

            const response  = await request(app).get('/').set('Accept', 'application/json');
            
            expect(response.status).toBe(401);
        });

    });


    describe('POST /', () => {

        test('should return 201', async () => {

            const response  = await request(app).post('/').set('Accept', 'application/json');
            
            expect(response.status).toBe(201);
        });

    });

});