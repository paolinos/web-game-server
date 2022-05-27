import { GAME_PLAYERS, GAME_TYPE, MATCH_ID, WS_PORT } from "../../consts";
import { publishMatchReady } from "../../public/pubsub/publishers/match.publisher";
import { hostname } from 'os';
import { GameServerAssignedMatchMessage } from "src/public/pubsub/consumers";
import { WebsocketConn, WebsocketConnEvent } from "../../public/ws";



interface UserMatchDto { 
    id: string; 
    email: string;
    points: number;
}

export interface MatchService {
    ready():Promise<void>;

    init(data:GameServerAssignedMatchMessage):Promise<void>

    runGame():Promise<void>

    end():Promise<void>

    error():Promise<void>
}

export class MatchBusinessLogic implements MatchService {
    
    private _users:UserMatchDto[] = [];
    private _ws:WebsocketConn;
    constructor(
    ) {
        this._ws = new WebsocketConn();
        this._ws.on(WebsocketConnEvent.CONNECTED, this.onWSConnected);
        this._ws.on(WebsocketConnEvent.MESSAGE, this.onWSMessage)
    }
    
    async ready(): Promise<void> {

        await publishMatchReady({
            id: MATCH_ID,
            host: `ws://${hostname()}:${WS_PORT}`,
            name: `${GAME_TYPE}, v1, 2 players`,    // settings of game
            type: GAME_TYPE,
            totalPlayers: GAME_PLAYERS
        });
    }

    /**
     * 
     */
    async init(data:GameServerAssignedMatchMessage): Promise<void> {

        this._users = data.users.map((user) => ({
            id:user.id, 
            email: user.email, 
            points: 0
        }));

        this._ws.acceptConnections(true);
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


    private onWSConnected () {
        console.log("onWSConnected - WebsocketConnEvent.CONNECTED");
    }
    private onWSMessage (data) {
        console.log("onWSMessage - WebsocketConnEvent.MESSAGE", data);
    }

}

export default new MatchBusinessLogic();