import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = "temp-secret"

@Injectable()
export class AuthService {
    

    async checkToken(token:string): Promise<boolean> {
        try {
            const result = verify(token, JWT_SECRET, {ignoreExpiration: false});
            return !result;
        } catch (error) {
            return false;
        }
    }


    async signIn(email:string):Promise<string> {
        //TODO: verify user not was already signed in
        let data:object = { email: email, last: new Date() };

        return sign(
            {
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data,
            }, 
            JWT_SECRET
        );
    }
}