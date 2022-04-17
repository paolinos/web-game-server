import { IRouter, Request } from 'express';
import {Router} from 'express'
import { AuthService } from '../../../application/interfaces/auth.service.interface';
import { UserSession } from "../../../application/interfaces/userSession.interface";
import authorizedUserMiddleware from '../middlewares/scope.middleware';
import {AuthBusinessLogic} from '../../../application/services/auth.service';

import ContextUnitOfWork from '../../../repositories/unitOfWork';
import { generateToken } from '../tools/token.tools';


export interface TokenValue {
    get token():string;
}

export const authRoutes = (service:AuthService):IRouter => {
    const router = Router();

    router.get('/', authorizedUserMiddleware, async (req:Request, res) => {

        return res.sendStatus(200);
    });

    router.post('/', async (req, res) => {
        // TODO: better validation? maybe in a future
        if(!req.body.email){
            return res.sendStatus(400);
        }

        const objResult = await service.signIn(req.body.email);
        if(!objResult.isValid()){
            return res.sendStatus(500);
        }

        const result:TokenValue = {
            token: generateToken(objResult.data)
        };

        return res.status(201).json(result);
    });

    return router;
}

export default authRoutes(new AuthBusinessLogic(ContextUnitOfWork.UserRepository));