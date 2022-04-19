import { EmptyObjectResult } from "../objectResult";

export interface UserService {

	searchGame(id:string, email:string):Promise<EmptyObjectResult>;

    cancelSearchGame(id:string):Promise<EmptyObjectResult>;
}