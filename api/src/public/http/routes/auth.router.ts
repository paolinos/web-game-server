import { Request, Response } from "express";
import iocContainer from "../../../ioc";
import { IOC_TYPES } from "../../../ioc.types";
import { z } from "zod";
import { UserAuthDto } from "core/dto/user.dto";
import { IAuthBusiness } from "core/business/auth.business";
import MSG from "../../../message";

const UserValidator = z.object({
	email: z.string().min(10).max(150),
	password: z.string().min(1).max(20),
});

const validateUserAuthDto = (
	body: any,
): { error: string | null; dto: UserAuthDto | null } => {
	const result: { error: string | null; dto: UserAuthDto | null } = {
		error: null,
		dto: null,
	};
	try {
		result.dto = UserValidator.parse(body);
	} catch (err: any) {
		result.error = MSG.HTTP.VALIDATION.USERNAME_PASSWORD_INVALID;
	}

	return result;
};

const authRouter = {
	post: async (req: Request, res: Response): Promise<void> => {
		const validation = validateUserAuthDto(req.body);
		if (validation.error) {
			res.status(422).json({ error: validation.error });
			return;
		}

		const authBuss = iocContainer.get<IAuthBusiness>(IOC_TYPES.AuthBusiness);
		const userAuth = await authBuss.authenticateUser(validation.dto!);
		res.status(201).json(userAuth);
	},
};

export default authRouter;
