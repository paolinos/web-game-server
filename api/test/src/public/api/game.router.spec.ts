import request from 'supertest';

import { createTestApp } from './tools';
import gameRoutes from '../../../../src/public/api/routers/game.router';

const app = createTestApp();
app.use(gameRoutes);


describe('Game Router', function() {

    describe('POST /', () => {

        test('should return 202', async () => {

            const response  = await request(app).post('/').set('Accept', 'application/json');
            
            expect(response.status).toBe(202);
        });

    });

});