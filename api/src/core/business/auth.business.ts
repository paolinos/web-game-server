import { injectable, inject } from "inversify";
import { IOC_TYPES } from "../../ioc.types";
import { IUserRepository } from "../../infrastructure/db/user.repository";
import { UserAuthDto, UserAuthResponse } from "../dto/user.dto";
import { generateToken } from "../../common/token";

export interface IAuthBusiness {
	authenticateUser(userAuth: UserAuthDto): Promise<UserAuthResponse>;
}

@injectable()
export class AuthBusiness implements IAuthBusiness {
	constructor(
		@inject(IOC_TYPES.UserRepository)
		private readonly userRepo: IUserRepository,
	) {}

	async authenticateUser(userAuth: UserAuthDto): Promise<UserAuthResponse> {
		let tmpUser = await this.userRepo.getByEmail(userAuth.email);
		if (!tmpUser) {
			tmpUser = await this.userRepo.addUser(userAuth.email, userAuth.password);
		}

		const result: UserAuthResponse = {
			token: generateToken({ email: userAuth.email }),
		};
		tmpUser.token = result.token;
		await this.userRepo.updateUser(tmpUser);

		return result;
	}
}
