import { AuthService } from '../../src/application/interfaces/auth.service.interface';
import { UserSession } from '../../src/application/interfaces/userSession.interface';

export class AuthServiceTest implements AuthService{

    signIn(email: string): Promise<UserSession> {
        throw new Error('Method not implemented.');
    }

    signInMock(email:string){
        return jest.spyOn(AuthServiceTest.prototype, 'signIn').mockImplementation(
            () => Promise.resolve({
                email,
                last: new Date()
            })
        );
    }
    
}