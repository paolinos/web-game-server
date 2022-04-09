import { IRouter } from 'express';
import {Router} from 'express'


const gameRoutes = ():IRouter => {
    const router = Router();

    /**
     * Search Game
     */
    router.post('/', async (req, res) => {
        res.sendStatus(202);
    });

    return router;
}

export default gameRoutes();