import { injectable, inject } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IUserRepository } from "../../infrastructure/db/user.repository";
import { verifyToken } from "../../common/token";

export interface IUserBusiness {
	checkToken(socketId: string, token: string): Promise<string | Error>;
}

@injectable()
export class UserBusiness implements IUserBusiness {
	constructor(
		@inject(IOC_TYPES.UserRepository)
		private readonly userRepo: IUserRepository,
	) {}

	/**
	 * Check token and identify Websocket for user
	 * @param socketId
	 * @param token
	 * @returns
	 */
	async checkToken(socketId: string, token: string): Promise<string | Error> {
		try {
			const tokenData = verifyToken<{ email: string }>(token);
			if (tokenData) {
				const user = await this.userRepo.getByEmail(tokenData.email);
				if (user) {
					user.socketId = socketId;
					await this.userRepo.updateUser(user);
					return user.email;
				}
			}
		} catch (error) {
			console.error("UserBusiness.checkToken Error:", error);
		}

		return new Error("Token is invalid");
	}
}
