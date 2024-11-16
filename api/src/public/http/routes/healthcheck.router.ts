import { Request, Response } from "express";

const healthcheckRouter = {
	get: async (_req: Request, res: Response) => {
		res.status(200).json({
			status: "Healthy",
			at: new Date(),
		});
	},
};

export default healthcheckRouter;
