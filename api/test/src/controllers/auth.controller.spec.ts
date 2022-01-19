import { Test, TestingModule } from '@nestjs/testing';

import { RepositoryModule } from '../../../src/repositories/repository.module';
import { AuthController } from '../../../src/core/auth/auth.controller';
import { AuthService } from '../../../src/core/auth/auth.service';
import { AuthDto } from '../../../src/core/auth/auth.dto';
import { TokenDto } from '../../../src/core/auth/token.dto';

describe('AppController', () => {
    let authController:AuthController;

    beforeAll(async () => {
        const app = await Test.createTestingModule({
            imports: [RepositoryModule],
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        authController = app.get<AuthController>(AuthController);
    });

    const createAuthDto = (email:string = "defaule@mail.com"):AuthDto => {
        const auth = new AuthDto();
        auth.email = email;
        return auth;
    }

    describe('SignIn', () => {
        it('Should return a token', async () => {
            const auth = createAuthDto();
            expect(await authController.signIn(auth)).toBeInstanceOf(TokenDto);
        });
    });

});
