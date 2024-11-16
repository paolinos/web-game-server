import "reflect-metadata";
import { Request, Response, Router } from "express";
import healthcheckRouter from "./healthcheck.router";
import authRouter from "./auth.router";

const router = Router({ caseSensitive: true });

router.post("/auth", authRouter.post);
router.get("/healthcheck", healthcheckRouter.get);

/**
 * Capture all
 */
router.all("*", async (_req: Request, res: Response) => {
	res.sendStatus(404);
});

/*
// TODO: middleware
router.use(async (err:Error, _req:Request, res:Response, _next:Function) => {
    console.error(err.stack);

    if(err instanceof UnauthorizedError){
        return res.sendStatus(401);
    }

    res.status(500).send('middleware  => Something broke!');
});
*/

export default router;
