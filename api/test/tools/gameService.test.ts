import { EmptyObjectResult, createSuccessEmptyResult, createErrorEmptyResult } from '../../src/application/objectResult';
import { GameService } from '../../src/application/interfaces/game.service.interface';


export class GameServiceTest implements GameService{

    searchGame(email: string): Promise<EmptyObjectResult> {
        throw new Error('Method not implemented.');
    }
    cancelSearchGame(email: string): Promise<EmptyObjectResult> {
        throw new Error('Method not implemented.');
    }

    searchGameMock(value:boolean, error:string = "404"){
        return jest.spyOn(GameServiceTest.prototype, 'searchGame')
            .mockImplementation(() => 
                Promise.resolve( value ? createSuccessEmptyResult() : createErrorEmptyResult(error) )
            );
    }

    cancelSearchGameMock(value:boolean, error:string = "404"){
        return jest.spyOn(GameServiceTest.prototype, 'cancelSearchGame')
            .mockImplementation(() => 
                Promise.resolve( value ? createSuccessEmptyResult() : createErrorEmptyResult(error) )
            );
    }

}