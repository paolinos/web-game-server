import { IRouter } from 'express';
import {Router} from 'express'


const userRoutes = ():IRouter => {
    const router = Router();

    router.get('/', async (req, res) => {
        res.sendStatus(401);
    });

    return router;
}

export default userRoutes();