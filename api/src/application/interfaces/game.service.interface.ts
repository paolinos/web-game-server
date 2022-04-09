export interface GameService {

	searchGame(email:string):Promise<boolean>;

    cancelSearchGame(email:string):Promise<boolean>;
}