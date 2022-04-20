import { v4 as uuidv4 } from 'uuid';
import { IdEntity } from './id.entity';

export interface MatchModel extends IdEntity {    
    usersIds:string[];
    createdAt:Date|null;
    endedAt:Date|null;

    matchHost:string|null;
    matchName:string|null;
}

export class Match implements MatchModel{
    public id: string;
    public usersIds: string[];
    public createdAt: Date|null;
    public endedAt: Date|null;
    public matchHost: string|null;
    public matchName: string|null;
    

    constructor(){
        this.id = uuidv4();
        this.usersIds = [];
        this.createdAt = null;

        this.endedAt = null;
        this.matchHost = null;
        this.matchName = null;
    }


    get isFree():boolean{
        return this.usersIds.length === 0;
    }
}