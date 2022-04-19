import { IdEntity } from './id.entity';

export interface UserInformation {
    id:string;

    email:string;

    searchingAt:Date;

    matchId:string|null;
}

export class User implements IdEntity,UserInformation{

    public readonly searchingAt:Date;
    public matchId:string|null;

    constructor(
        public readonly id:string, 
        public readonly email:string,
        ){
        this.searchingAt = new Date();
        this.matchId = null;
    }

    get isAvailable():boolean{
        return this.matchId === null;
    }
}