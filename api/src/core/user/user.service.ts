import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

	async getUserByEmail(email:string):Promise<{email:string, points:number}>  {

		// TODO: 
		//    - get user
		//    - return user

		return {email:email, points:1000}
	}
}
