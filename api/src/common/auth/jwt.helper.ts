import { sign, verify } from 'jsonwebtoken';

import { JWT_EXPIRATION, JWT_SECRET } from '../../consts';

/**
 * 
 * @param token string
 * @param ignoreExpiration (optional) default false 
 * @returns object or null
 */
export const parseToken = (token:string, ignoreExpiration:boolean=false):object|null => {
    try {
        const result:any = verify(token, JWT_SECRET, {ignoreExpiration});
        if(result){
            return result.data;
        }
    } catch (error) {
        // NOTE: log in console
        console.warn(`parseToken invalid. token : ${token} => `,error);
    }
    return null;
}

/**
 * Generate token from object
 * @param data object to encrypt into jwt
 * @returns string
 */
export const generateToken = (data:object) : string => {
    return sign(
        {
            exp: Math.floor(Date.now() / 1000) + (60 * JWT_EXPIRATION),
            data,
        }, 
        JWT_SECRET
    );
}