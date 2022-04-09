import { IRouter, Request } from 'express';
import {Router} from 'express'
import { AuthService } from '../../../application/interfaces/auth.service.interface';
import {authorizedUserMiddleware, ScopeRequest} from '../middlewares/scope.middleware';
import {AuthBusinessLogic} from '../../../application/services/auth.service';

import ContextUnitOfWork from '../../../repositories/unitOfWork';
import { generateToken } from '../tools/token.tools';


interface TokenValue {
    get token():string;
}

const authRoutes = (service:AuthService):IRouter => {
    const router = Router();

    router.get('/', authorizedUserMiddleware, async (req:Request, res) => {

        res.sendStatus(200);
    });

    router.post('/', async (req, res) => {
        // TODO: better validation? maybe in a future
        if(!req.body.email){
            return res.sendStatus(400);
        }

        const user = await service.signIn(req.body.email);
        if(!user){
            return res.sendStatus(501);
        }

        const result:TokenValue = {
            token: generateToken(user)
        };
        res.status(201).json(result);
    });

    return router;
}

export default authRoutes(new AuthBusinessLogic(ContextUnitOfWork.UserRepository));