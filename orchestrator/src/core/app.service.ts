import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { UserDto } from './user.dto';
import { Match } from './match';
import { APP_RABBIT_SERVICE } from './app.const';
import { CREATED_MATCH_EVENT } from '../microservice/rabbitmq/events';

const PLAYERS_TO_PLAY:number = 2;

@Injectable()
export class AppService {

	private readonly userQueue:UserDto[] = [];
	private readonly matchs: { [id: string]: Match } = {};

	constructor(
		@Inject(APP_RABBIT_SERVICE) private appRabbitService: ClientProxy
	){}

	async searchGameForUser(user:UserDto):Promise<void>{
		// TODO:
		//  Add user to Queue
		const total = this.addUserIfNotExist(user);
		if(total >= PLAYERS_TO_PLAY){
			this.createMatch();
		}
	}

	private addUserIfNotExist(user:UserDto):number{
		const pos = this.userQueue.findIndex(q => q.userId === user.userId);
		if(pos === -1){
			return this.userQueue.push(user);
		}
		return 0;
	}

	private createMatch(){
		// Remove players from Queue
		const playerOne = this.userQueue.shift();
		const playerTwo = this.userQueue.shift();

		// Create Match
		const match = new Match([playerOne, playerTwo]);
		this.matchs[match.id] = match;

		// Notify api User's match
		this.appRabbitService.emit(CREATED_MATCH_EVENT, match);

		console.log(CREATED_MATCH_EVENT, match);

		// TODO: Check if some match/game server is ready and notify
	}

}
