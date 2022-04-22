import { IdEntity } from './id.entity';

export enum UserStatus {
    DEFAULT = "default",
    SEARCHING_GAME = "searching-game",
    CANCEL_SEARCHING_GAME = "cancel-searching-game",
    ASSIGNED_TO_MATCH = "assigned-to-match",
    PLAYING_MATCH = "playing-match",
    END_MATCH = "end-match",
}

export interface UserInformation {
    id:string;
    email:string;
    status:UserStatus;
    updatedAt:Date;
}

export class User implements IdEntity, UserInformation{

    public status:UserStatus;
    public updatedAt:Date;

    constructor(
        public readonly id:string, 
        public readonly email:string,
        ){
        this.status = UserStatus.DEFAULT;
        this.updatedAt = new Date();
    }

    get isAvailable():boolean{
        return this.status === UserStatus.DEFAULT;
    }
}

export enum UserConnectionStatus {
    WAITING = "waiting",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected"
}

export interface UserMatch {
    id:string;
    email: string;
    points:number;
    status:UserConnectionStatus;
}