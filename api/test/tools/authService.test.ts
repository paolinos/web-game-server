import { ObjectResult, createSuccessResult, createErrorResult } from '../../src/application/objectResult';
import { AuthService } from '../../src/application/interfaces/auth.service.interface';
import { UserSession } from '../../src/application/interfaces/userSession.interface';

export class AuthServiceTest implements AuthService{

    signIn(email: string): Promise<ObjectResult<UserSession>> {
        throw new Error('Method not implemented.');
    }

    signInMock(success:boolean, email:string, error:string="404"){
        return jest.spyOn(AuthServiceTest.prototype, 'signIn')
            .mockImplementation(() => 
                Promise.resolve(
                    success ? createSuccessResult({
                        email,
                        last: new Date()
                    }) :
                    createErrorResult(error)
                
            )
        );
    }
    
}