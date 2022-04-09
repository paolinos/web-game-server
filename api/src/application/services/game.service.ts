import { UserRepository } from '../../repositories/user.repository';
import { UserStatus } from '../../domain/user';
import { SEARCH_GAME_EVENT } from '../../microservice/rabbitmq/events';
import { MessageBrokerService } from '../interfaces/messageBroker.service.interface';
import { GameService } from '../interfaces/game.service.interface';



export class GameBusinessLogic implements GameService {

    constructor(
		private readonly userRepository:UserRepository
		//private broker:MessageBrokerService
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

				// TODO: add broker
				//await this.broker.publish(SEARCH_GAME_EVENT, { userId: user.id, username: user.email });

				return true;	
			}
		}

		return false;
	}

	async cancelSearchGame(email:string):Promise<boolean> {
		const user = await this.userRepository.getByEmail(email);
		if(user){
			if(user.status === UserStatus.SEARCHING){
				user.status = UserStatus.DEFAULT;

				await this.userRepository.save(user);

				return true;
			}
		}
		return false;
	}
}
