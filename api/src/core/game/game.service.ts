import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {

	async searchGame(email:string):Promise<boolean>  {

		// TODO: 
		//    - get user
		//    - check if user is already in a match (user disconnect or user leave the match)
		//    - add user to get a match

		return true;

	}
}
