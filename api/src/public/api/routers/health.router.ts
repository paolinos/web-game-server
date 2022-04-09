import { IRouter } from 'express';
import {Router} from 'express'


const healthRoutes = ():IRouter => {
    const router = Router();

    router.get('/', async (req, res) => {
        const time = new Date();

        // TODO: check services
        
        res.json({
            status: "Healthy",
            at: new Date(),
            totalDuration: new Date(new Date().getTime() - time.getTime()).toTimeString(),
            entries: [
                {}
            ]
        })
    });

    return router;
}

export default healthRoutes();