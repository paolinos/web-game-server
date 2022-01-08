import { IdEntity } from './id.entity';
import { User, UserInformation } from "./user";
import { v4 as uuidv4 } from 'uuid';

export class Match implements IdEntity{
    public id:string;

    public users:UserInformation[] = [];

    public status:MatchStatus = MatchStatus.STAND_BY;

    constructor(){
        // NOTE: this is only an example. But uuidv4() SHOULD NOT BE HERE
        this.id = uuidv4();
    }
}

export enum MatchStatus{
    STAND_BY = 0,
    WAITING_PLAYERS = 1,
    PLAYING = 2,
    END_GAME = 3
}