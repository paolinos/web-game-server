import { GameService } from '../../src/application/interfaces/game.service.interface';


export class GameServiceTest implements GameService{

    searchGame(email: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    cancelSearchGame(email: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    searchGameMock(value:boolean){
        return jest.spyOn(GameServiceTest.prototype, 'searchGame').mockImplementation(
            () => Promise.resolve(value)
        );
    }

    cancelSearchGameMock(value:boolean){
        return jest.spyOn(GameServiceTest.prototype, 'cancelSearchGame').mockImplementation(
            () => Promise.resolve(value)
        );
    }

}