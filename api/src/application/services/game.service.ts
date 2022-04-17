import { UserRepository } from '../../repositories/user.repository';
import { UserStatus } from '../../domain/user';
import { GameService } from '../interfaces/game.service.interface';
import { publishSearchGame, publishStopSearchingGame } from '../../public/pubsub/publishers/publish';
import { createErrorEmptyResult, createSuccessEmptyResult, EmptyObjectResult } from '../objectResult';



export class GameBusinessLogic implements GameService {

    constructor(
		private readonly userRepository:UserRepository
		//private broker:MessageBrokerService
	){}

	async searchGame(email:string):Promise<EmptyObjectResult>  {

		const user = await this.userRepository.getByEmail(email);
		if(user){
			if(user.status === UserStatus.DEFAULT){
				user.status = UserStatus.SEARCHING;
				
				// TODO: should be a Transactional outbox pattern or something similar. but as Repo is not a DB. no problm
				//	Yes, we don't need to save becasue we are working with object, but should be nice to implement the Transactional outbox pattern. 
				await this.userRepository.save(user);	// No needed, but we want to think that there is a DB.

				await publishSearchGame({
					id: user.id,
					email: user.email,
				})

				return createSuccessEmptyResult();
			}else{
				return createErrorEmptyResult("User already is searching");
			}
		}

		return createErrorEmptyResult("404");
	}

	async cancelSearchGame(email:string):Promise<EmptyObjectResult> {
		const user = await this.userRepository.getByEmail(email);
		if(user){
			if(user.status === UserStatus.SEARCHING){
				user.status = UserStatus.DEFAULT;

				await this.userRepository.save(user);

				await publishStopSearchingGame({
					id: user.id,
					email: user.email,
				})

				return createSuccessEmptyResult();
			}else{
				return createErrorEmptyResult("User is not searching");
			}
		}
		return createErrorEmptyResult("404");
	}
}
