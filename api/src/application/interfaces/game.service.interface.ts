import { EmptyObjectResult } from "../objectResult";

export interface GameService {

	searchGame(email:string):Promise<EmptyObjectResult>;

    cancelSearchGame(email:string):Promise<EmptyObjectResult>;
}