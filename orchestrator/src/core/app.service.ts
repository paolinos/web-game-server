import { Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { Match } from './match';

const PLAYERS_TO_PLAY:number = 2;

@Injectable()
export class AppService {

	private readonly userQueue:UserDto[] = [];
	private readonly matchs: { [id: string]: Match } = {};

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

		// TODO: Create Match
		const match = new Match([playerOne, playerTwo]);
		this.matchs[match.id] = match;

		// TODO: Notify api User's match
		
	}

}
