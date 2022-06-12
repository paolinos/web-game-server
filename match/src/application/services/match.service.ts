import { GAME_PLAYERS, GAME_TYPE, MatchStatus, MATCH_ID, MATCH_TIME_SECONDS, WS_PORT } from "../../consts";
import { publishMatchEnd, publishMatchReady } from "../../public/pubsub/publishers/match.publisher";
import { hostname } from 'os';
import { GameServerAssignedMatchMessage } from "src/public/pubsub/consumers";
import { IWebsocketConn, WebsocketConn, WebsocketConnEvent } from "../../public/ws";
import { UserSession } from "../../tools/token.tools";
import { publishTopic } from "../../public/pubsub/publishers/publisher";
import { TOPIC } from "../../public/pubsub/topics";
import Timer, { TimerId } from '../../tools/timer';


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
    private _ws:IWebsocketConn;

    private _matchStats:MatchStatus;

    private _statLogs:{status:MatchStatus, userStatus:any[], at:Date }[] = [];

    private _timer:TimerId;

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
        // TODO:
        throw new Error("Method not implemented.");
    }
    end(): Promise<void> {
        // TODO:
        throw new Error("Method not implemented.");
    }
    error(): Promise<void> {
        // TODO:
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

            // TODO: NOT USE publishTopic! 
            await publishTopic(TOPIC.MATCH_INIT, {matchId: MATCH_ID});

            // Start time:
            this._timer = Timer.runTimer(MATCH_TIME_SECONDS, this.onMatchTimeout.bind(this));

        }
    }

    private async onWSMessage (userSession:UserSession, data:string) {
        
        if(this._matchStats !== MatchStatus.PLAYING){
            console.warn(`onWSMessage - WebsocketConnEvent.MESSAGE - NOT ALLOWED, match status: ${this._matchStats}`, data);
            return;
        }

        const user = this._users.find(q => q.email === userSession.email);
        const now = new Date();
        user.stats.message_response = user.stats.last_message ? now.getTime() - user.stats.last_message.getTime() : 0;
        user.stats.last_message = now;

        await this.gameUpdate(user, data);
    }


    private async gameUpdate(currentUser:UserMatchDto, data:string):Promise<void> {
        // TODO: parse message logic (game if is able)
        // TODO: check uses movement, send update to others.

        // Update other users:
        // TODO: create an interface for message.
        const message = {
            status: "update",
            users: [
                {
                    id: currentUser.id,
                    data: data
                }
            ]
        };
        this._ws.sendMessageToOthers(currentUser.email, message);
    }

    private async onEndGame(timeout:boolean):Promise<void> {
        let message:any;

        // TODO: refactor
        let endGameStatus:string;
        if(timeout){
            endGameStatus = 'time out';
            message = {
                status: "end-game",
                type: endGameStatus,
                users: [
                    // TODO:
                ]
            };
        }else {
            endGameStatus = 'player-win'
            message = {
                status: "end-game",
                type: endGameStatus,
                users: [
                    // TODO:
                ]
            };
        }

        this._ws.sendMessageToAll(message);

        this.updateStatus(MatchStatus.END_GAME);

        const biggestScore = this._users.sort((a,b) => b.points - a.points)[0].points;
        const playersWins = this._users.filter(q => q.points === biggestScore).map(q => q.id);

        await publishMatchEnd({
            id: MATCH_ID,
            type: GAME_TYPE,
            players: this._users.map(q => ({id: q.id, email: q.email, points: q.points})),
            status: endGameStatus,
            playersWins,
            typeOfEnd: playersWins.length === 1 ? 'player-win' : 'draw'
        });

        // Disconnect
        let timeOutId = setTimeout(async() => {
            clearTimeout(timeOutId);

            // disconnect clients
            this._ws.disconnectClients();

            this._users = [];

        }, 1000);

    }


    private async onMatchTimeout() {
        Timer.delete(this._timer);

        await this.onEndGame(true);
    }
}

export default new MatchBusinessLogic();