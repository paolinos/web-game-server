import { GAME_PLAYERS, GAME_TYPE, MatchStatus, MATCH_ID, WS_PORT } from "../../consts";
import { publishMatchReady } from "../../public/pubsub/publishers/match.publisher";
import { hostname } from 'os';
import { GameServerAssignedMatchMessage } from "src/public/pubsub/consumers";
import { WebsocketConn, WebsocketConnEvent } from "../../public/ws";
import { UserSession } from "../../tools/token.tools";
import { publishTopic } from "../../public/pubsub/publishers/publisher";
import { TOPIC } from "../../public/pubsub/topics";


enum UserStatus {
    DEFAULT = "default",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected"
}

interface UserStats {
    first_connection:Date,
    last_connection:Date,
    message_response:number,
    last_message:Date
}

interface UserMatchDto { 
    id: string; 
    email: string;
    points: number;
    status: UserStatus,
    stats: UserStats
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

    private _matchStats:MatchStatus;

    private _statLogs:{status:MatchStatus, userStatus:any[], at:Date }[] = [];

    constructor(
    ) {
        this._ws = new WebsocketConn();
        this._ws.on(WebsocketConnEvent.CONNECTED, this.onWSConnected.bind(this));
        this._ws.on(WebsocketConnEvent.MESSAGE, this.onWSMessage.bind(this));

        this.updateStatus(MatchStatus.STAND_BY);
    }
    
    async ready(): Promise<void> {

        await publishMatchReady({
            id: MATCH_ID,
            host: `ws://${hostname()}:${WS_PORT}`,
            name: `${GAME_TYPE}, v1, 2 players`,    // settings of game
            type: GAME_TYPE,
            totalPlayers: GAME_PLAYERS
        });

        this.updateStatus(MatchStatus.WAITING_PLAYERS);
    }

    private updateStatus(match:MatchStatus){
        this._matchStats = match;
        this._statLogs.push({
            status: this._matchStats,
            at: new Date(),
            userStatus: this._users.map(q => ({
                id: q.id,
                status: q.status
            }))
        })
    }

    /**
     * 
     */
    async init(data:GameServerAssignedMatchMessage): Promise<void> {

        this._users = data.users.map((user) => ({
            id: user.id, 
            email: user.email, 
            points: 0,
            status: UserStatus.DEFAULT,
            stats: null
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


    private async onWSConnected (userSession:UserSession) {
        console.log("onWSConnected - WebsocketConnEvent.CONNECTED",userSession);

        const user = this._users.find(q => q.email === userSession.email);
        user.status = UserStatus.CONNECTED;
        if(!user.stats){
            user.stats = {
                first_connection: new Date(),
                last_connection: new Date(),
                message_response: 0,
                last_message: null
            }
        } else {
            user.stats.last_connection = new Date();
        }

        const connectedUsers = this._users.filter(q => q.status === UserStatus.CONNECTED);
        if(connectedUsers.length === GAME_PLAYERS){
            this.updateStatus(MatchStatus.PLAYING);

            // start game
            await publishTopic(TOPIC.MATCH_INIT, {matchId: MATCH_ID});
        }
    }

    private onWSMessage (userSession:UserSession, data:string) {
        
        if(this._matchStats !== MatchStatus.PLAYING){
            console.warn(`onWSMessage - WebsocketConnEvent.MESSAGE - NOT ALLOWED, match status: ${this._matchStats}`, data);
            return;
        }

        const user = this._users.find(q => q.email === userSession.email);
        const now = new Date();
        user.stats.message_response = user.stats.last_message ? now.getTime() - user.stats.last_message.getTime() : 0;
        user.stats.last_message = now;

        // TODO: parse message logic (game if is able)
        // TODO: check uses movement, send update to others.
    }

}

export default new MatchBusinessLogic();