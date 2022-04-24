import { v4 as uuidv4 } from 'uuid';
import { IdEntity } from './id.entity';
import { UserConnectionStatus, UserMatch } from './user';

export enum MatchStatus {
    DEFAULT = "default",
    WAITING_PLAYERS = "waiting-players",
    WAITING_SOME_PLAYERS = "waiting-some-players",
    PLAYING = "playing",
    END = "end",
}



export interface MatchModel extends IdEntity {    
    gameServerId:string;
    gameServerHost:string;
    status:MatchStatus;
    users:UserMatch[];
    createdAt:Date;
    endedAt:Date|null;
}

export class Match implements MatchModel{
    public id: string;
    public gameServerId:string = "";
    public gameServerHost:string = "";
    public status:MatchStatus = MatchStatus.DEFAULT;
    public users:UserMatch[] = [];
    public createdAt:Date;
    public endedAt:Date|null = null;

    constructor(){
        this.id = uuidv4();
        this.createdAt = new Date();
    }

    static newMatch(gameServerId:string, gameServerHost:string, users:{id:string, email:string}[]):Match{
        const lobby = new Match();
        lobby.gameServerId = gameServerId;
        lobby.gameServerHost = gameServerHost;
        lobby.users = users.map(q => ({
            id: q.id,
            email: q.email,
            status: UserConnectionStatus.WAITING,
            points: 0
        }));
        
        return lobby;
    }
}



export interface UserGameInfo extends IdEntity{
    email:string;
    points:number;
    status:UserGameStatus
}

export enum UserGameStatus {
    WAITING = "waiting-for-user",
    CONNECTED = "user-connected",
    DISCONNECTED = "user-disconnected",
}