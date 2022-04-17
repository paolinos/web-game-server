import { IRouter } from 'express';
import {Router} from 'express'
import { GameService } from '../../../application/interfaces/game.service.interface';
import { GameBusinessLogic } from '../../../application/services/game.service';
import authorizedUserMiddleware, { ScopeRequest } from '../middlewares/scope.middleware';
import ContextUnitOfWork from '../../../repositories/unitOfWork';

export const gameRoutes = (service:GameService):IRouter => {
    const router = Router();

    /**
     * Search Game
     */
    router.post('/search', authorizedUserMiddleware,  async (req, res) => {

        const scopeReq = req as ScopeRequest;
        const result = await service.searchGame(scopeReq.scope.user.email);
        
		if(!result.isValid()){
            if(result.error === "404"){
                return res.status(404).json()    
            }
			return res.status(400).json({error: result.error});
		}

        // Accepted
        res.sendStatus(202);
    });

    router.delete('/search', authorizedUserMiddleware,  async (req, res) => {
        const scopeReq = req as ScopeRequest;
        const result = await service.cancelSearchGame(scopeReq.scope.user.email);
        
        if(!result.isValid()){
            if(result.error === "404"){
                return res.status(404).json()    
            }
			return res.status(400).json({error: result.error});
		}

        res.sendStatus(202);
    });

    return router;
}

export default gameRoutes(new GameBusinessLogic(ContextUnitOfWork.UserRepository));