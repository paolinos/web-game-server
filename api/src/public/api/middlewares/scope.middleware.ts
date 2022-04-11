import { Request } from "express";
import { UserSession } from "../../../application/interfaces/userSession.interface";
import { getBearerTokenFromRequest, parseToken } from "../tools/token.tools";
import {UnauthorizedError} from '../../../common/errors/unauthorized.error';

export class Scope{

    constructor(
        public readonly token:string,
        public readonly user: UserSession
    ){ }
}

export interface ScopeRequest extends Request{
    get scope():Scope;
}

// @ts-ignore
const authorizedUserMiddleware = (req, res, next) => {
    const token = getBearerTokenFromRequest(req);
    
    if(token){
        const jwtObj = parseToken(token);

        if(jwtObj !== null){
            req.scope = new Scope(token, jwtObj);
            next();
            return;
        }
    }
    
    // TODO: user AppErrorCode(401) or application error.
    next(new UnauthorizedError());
}

export default authorizedUserMiddleware;