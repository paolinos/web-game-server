import { GAME_PLAYERS, GAME_TYPE, MATCH_ID } from "../../consts";
import { publishMatchReady } from "../../public/pubsub/publishers/match.publisher";
import { hostname } from 'os';

export interface MatchService {
    ready():Promise<void>;

    init():Promise<void>

    runGame():Promise<void>

    end():Promise<void>

    error():Promise<void>
}

export class MatchBusinessLogic implements MatchService {
    constructor(
    ) {}
    
    async ready(): Promise<void> {

        await publishMatchReady({
            id: MATCH_ID,
            host: hostname(),
            name: `${GAME_TYPE}, v1, 2 players`,
            type: GAME_TYPE,
            totalPlayers: GAME_PLAYERS
        });
    }

    /**
     * Add users
     */
    async init(): Promise<void> {
    }

    async runGame(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    end(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    error(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}