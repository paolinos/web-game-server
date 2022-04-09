import {Request, Response, Router} from 'express';
import {urlencoded as bodyParserUrlencoded, json as bodyParserJson} from 'body-parser';

import authRoutes from './auth.router';
import gameRoutes from './game.router';
import healthRoutes from './health.router';
import userRoutes from './user.router';

const router = Router();

router.use(bodyParserUrlencoded({ extended: false }))
router.use(bodyParserJson())

router.use('/auth', authRoutes);
router.use('/game', gameRoutes)
router.use('/user', userRoutes);
router.use('/health', healthRoutes);

/**
 * Capture all 
 */
router.all('*', async (req:Request, res:Response) => {
    res.sendStatus(404);
}) 


router.use(async (err:Error, req:Request, res:Response, next:Function) => {
    console.error(err.stack);
    res.status(500).send('middleware  => Something broke!')
});




export default router;