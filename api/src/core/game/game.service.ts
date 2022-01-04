import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../repositories/user.repository';
import { UserStatus } from '../../domain/user';


@Injectable()
export class GameService {

    constructor(
		private readonly userRepository:UserRepository
	){}

	async searchGame(email:string):Promise<boolean>  {

		const user = await this.userRepository.getByEmail(email);
		if(user){
			if(user.status === UserStatus.DEFAULT){
				user.status = UserStatus.SEARCHING;
				await this.userRepository.save(user);

				// TODO: send message

				return true;	
			}
		}

		return false;
	}
}
