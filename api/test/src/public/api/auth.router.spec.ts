import request from 'supertest';

import { createTestApp, createUserSession } from './tools';
import { authRoutes } from '../../../../src/public/api/routers/auth.router';
import { AuthServiceTest } from '../../../tools/authService.test';
import { createGenerateTokenMock } from '../../../tools/tokenTools.test';
import { createAuthorizedUserMiddlewareMock } from '../../../tools/middleware.mock';

afterEach(() => {
    jest.resetAllMocks();
});

const authServiceMock = new AuthServiceTest();
const app = createTestApp()
    .use(authRoutes(authServiceMock));

describe('Auth Router', function() {

    describe('GET /', () => {

        test('should return 200', async () => {
            createAuthorizedUserMiddlewareMock("test-token", createUserSession("email@test.com"));

            const response  = await request(app).get('/');

            expect(response.status).toBe(200);
        });
    });


    describe('POST /', () => {
        
        test('should return 201', async () => {
            const email = "user-email@test.com";
            const token = "some-token-test";

            const signInMock = authServiceMock.signInMock(email);
            const generateTokenMock = createGenerateTokenMock(token);

            const response  = await request(app).post('/').send({email: email});
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token");
            expect(response.body.token).toBe(token);

            expect(signInMock).toBeCalledTimes(1);
            expect(generateTokenMock).toHaveBeenCalledTimes(1);
        });

        test('should return 400 when email in body is missing', async () => {
            const signInMock = authServiceMock.signInMock("email@test.com");
            const generateTokenMock = createGenerateTokenMock("some-token-test");

            const response  = await request(app).post('/');
            
            expect(response.status).toBe(400);

            expect(signInMock).toBeCalledTimes(0);
            expect(generateTokenMock).toHaveBeenCalledTimes(0);
        });


        test('should return 500 when signIn service fail', async () => {
            const generateTokenMock = createGenerateTokenMock("some-token-test");

            const response  = await request(app).post('/').send({email: "some@email.com"});
            
            expect(response.status).toBe(500);

            expect(generateTokenMock).toHaveBeenCalledTimes(0);
        });

    });

});