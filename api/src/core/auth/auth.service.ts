import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { User } from '../../domain/user';
import { UserRepository } from '../../repositories/user.repository';

const JWT_SECRET = "temp-secret"

@Injectable()
export class AuthService {

    private readonly userRepository:UserRepository;

    constructor(userRepository:UserRepository){
        this.userRepository = userRepository;
    }

    async checkToken(token:string): Promise<boolean> {
        try {
            const result = verify(token, JWT_SECRET, {ignoreExpiration: false});
            return !result;
        } catch (error) {
            return false;
        }
    }


    async signIn(email:string):Promise<string> {

        let user = await this.userRepository.getByEmail(email);
        if(!user){
            user = new User(email);
        }else{
            user.lastSigin = new Date();
        }
        await this.userRepository.save(user);

        let data:object = { email: email, last: user.lastSigin };

        return sign(
            {
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data,
            }, 
            JWT_SECRET
        );
    }
}