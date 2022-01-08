import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { UserRepository } from '../../repositories/user.repository';
import { UserStatus } from '../../domain/user';
import { APP_RABBIT_SERVICE } from './game.const';
import { SEARCH_GAME_EVENT } from '../../microservice/rabbitmq/events';



@Injectable()
export class GameService {

    constructor(
		private readonly userRepository:UserRepository,
		@Inject(APP_RABBIT_SERVICE) private appRabbitService: ClientProxy
	){}

	async searchGame(email:string):Promise<boolean>  {

		const user = await this.userRepository.getByEmail(email);
		if(user){
			if(user.status === UserStatus.DEFAULT){
				user.status = UserStatus.SEARCHING;
				
				// TODO:
				//	 review Transactional outbox pattern or something similar
				//	Yes, we don't need to save becasue we are working with object, but should be nice to implement the Transactional outbox pattern. 
				await this.userRepository.save(user);	// No needed, but we want to think that there is a DB.

				await this.appRabbitService.emit(SEARCH_GAME_EVENT, { userId: user.id, username: user.email });

				return true;	
			}
		}

		return false;
	}
}
