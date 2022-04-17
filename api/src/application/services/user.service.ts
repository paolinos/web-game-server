import { User } from '../../domain/user';

import { UserRepository } from '../../repositories/user.repository';

export class UserService {

	private readonly userRepository:UserRepository;

	constructor(
		userRepository:UserRepository
	){
		this.userRepository = userRepository;
	}

	async getUserByEmail(email:string):Promise<User>  {
		return await this.userRepository.getByEmail(email) as User;
	}
}
