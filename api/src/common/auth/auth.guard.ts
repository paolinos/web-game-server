import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { parseToken } from './jwt.helper';

/**
 * Get Authorization token from header
 * @param context 
 * @returns 
 */
export const getTokenFromHeader = (context: ExecutionContext): { request: any, token: string } => {
    const request = context.switchToHttp().getRequest();

    const auth: string = request.headers['authorization'];
    if (auth && auth.substring(0, 6).toLowerCase() === 'bearer') {
        return { request, token: auth.substring(7) };
    }
    return null;
}

const runGuard = (context: ExecutionContext, ignore:boolean = false) => {
    const result = getTokenFromHeader(context);

        if (result !== null){
            const jwtObj = parseToken(result.token);
            result.request.scope = null;
            if(jwtObj !== null){
                result.request.scope = {
                    user: jwtObj,
                    token: result.token
                }
                
                return true;
            }
        }
        return ignore ? true : false;
}

/**
 * AuthGuard, check for jwt token in authorization header
 */
@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        
        return runGuard(context);
    }
}


/**
 * AuthGuardButContinue same as AuthGuard but will continue also if jwt is not exist or not exist.
 */
@Injectable()
export class AuthGuardButContinue implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        
        return runGuard(context, true);
    }
}