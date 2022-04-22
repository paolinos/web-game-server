import { v4 as uuidv4 } from 'uuid';
import { IdEntity } from './id.entity';

export enum GameType {
    DEFAULT = "default",
    PONG = "pong-game"
}

export enum GameServerStatus {
    DEFAULT = "default",
    READY = "ready",
    WAITING_PLAYERS = "waiting-players",
    PLAYING = "playing"
}

export interface GameServerModel extends IdEntity {
    host:string;
    name:string;
    type:string;
    totalPlayers:number;
    status:GameServerStatus;
    updatedAt:Date;
}

export class GameServer implements GameServerModel{
    public id:string;
    public host:string;
    public name:string;
    public type:string = GameType.DEFAULT;
    public totalPlayers:number = 0;
    public status:GameServerStatus = GameServerStatus.DEFAULT;
    public updatedAt:Date;

    constructor(){
        this.id = uuidv4();
        this.host = "";
        this.name = "";
        this.updatedAt = new Date();
    }

    get isFree():boolean{
        return this.status === GameServerStatus.READY;
    }
}