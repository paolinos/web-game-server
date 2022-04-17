import { User } from '../../domain/user';
import { UserRepository } from '../../repositories/user.repository';
import { AuthService } from '../interfaces/auth.service.interface';
import { UserSession } from '../interfaces/userSession.interface';
import { createSuccessResult, ObjectResult } from '../objectResult';

export class AuthBusinessLogic implements AuthService {

    private readonly userRepository:UserRepository;

    constructor(userRepository:UserRepository){
        this.userRepository = userRepository;
    }

    async signIn(email:string):Promise<ObjectResult<UserSession>> {

        let user = await this.userRepository.getByEmail(email);
        if(!user){
            user = new User(email);
        }else{
            user.lastSigin = new Date();
        }
        await this.userRepository.save(user);

        // TODO: Emit event to check if player was playing? 
        //let data:object = { email: email, last: user.lastSigin };
        //return generateToken(data);

        // TODO: just return User. to review this
        return createSuccessResult<UserSession>({ email: user.email, last: user.lastSigin });
    }
}