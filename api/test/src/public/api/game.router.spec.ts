import request from 'supertest';

import { createTestApp, createUserSession } from './tools';
import { gameRoutes } from '../../../../src/public/api/routers/game.router';
import { createAuthorizedUserMiddlewareMock } from '../../../tools/middleware.mock';
import { GameServiceTest } from '../../../tools/gameService.test';
import { GameBusinessLogic } from '../../../../src/application/services/game.service';

afterEach(() => {
    jest.resetAllMocks();
});

const serviceTest = new GameServiceTest();
const app = createTestApp()
    .use(gameRoutes(serviceTest));

describe('Game Router', function() {

    describe('POST /', () => {

        test('should return 202', async () => {
            createAuthorizedUserMiddlewareMock("test-token", createUserSession("email@test.com"));
            const searchGameMock = serviceTest.searchGameMock(true);

            const response  = await request(app).post('/search').set('Accept', 'application/json');
            
            expect(response.status).toBe(202);

            expect(searchGameMock).toBeCalledTimes(1);
        });

    });

});