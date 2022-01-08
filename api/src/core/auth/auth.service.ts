import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user';
import { UserRepository } from '../../repositories/user.repository';
import { parseToken, generateToken } from '../../common/auth/jwt.helper';

@Injectable()
export class AuthService {

    private readonly userRepository:UserRepository;

    constructor(userRepository:UserRepository){
        this.userRepository = userRepository;
    }

    async checkToken(token:string): Promise<boolean> {

        const data = parseToken(token);
        return data !== null;
    }


    async signIn(email:string):Promise<string> {

        let user = await this.userRepository.getByEmail(email);
        if(!user){
            user = new User(email);
        }else{
            user.lastSigin = new Date();
        }
        await this.userRepository.save(user);

        // TODO: Emit event to check if player was playing? 

        let data:object = { email: email, last: user.lastSigin };

        return generateToken(data);
    }
}