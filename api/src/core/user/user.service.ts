import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user';

import { UserRepository } from '../../repositories/user.repository';

@Injectable()
export class UserService {

	private readonly userRepository:UserRepository;

	constructor(
		userRepository:UserRepository
	){
		this.userRepository = userRepository;
	}

	async getUserByEmail(email:string):Promise<User>  {

		const user = await this.userRepository.getByEmail(email);
		return user;
	}
}
