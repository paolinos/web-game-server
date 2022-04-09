import { IRouter } from 'express';
import {Router} from 'express'


const authRoutes = ():IRouter => {
    const router = Router();

    router.get('/', async (req, res) => {
        res.sendStatus(401);
    });

    router.post('/', async (req, res) => {
        res.sendStatus(201);
    });

    return router;
}

export default authRoutes();