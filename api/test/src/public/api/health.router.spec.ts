import request from 'supertest';

import { createTestApp } from './tools';
import healthRoutes from '../../../../src/public/api/routers/health.router';

const app = createTestApp();
app.use(healthRoutes);


describe('Game Router', function() {

    describe('GET /', () => {

        test('should return 200', async () => {

            const response  = await request(app).get('/').set('Accept', 'application/json');
            
            expect(response.status).toBe(200);
        });

    });

});