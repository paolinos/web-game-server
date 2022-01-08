import { IdEntity } from './id.entity';
import { v4 as uuidv4 } from 'uuid';

export interface UserInformation {
    id:string;

    email:string;

    points:number;
}

export class User implements IdEntity, UserInformation{
    public id:string;

    public email:string;

    public lastSigin:Date;

    public points:number = 0;

    public status:UserStatus = UserStatus.DEFAULT;

    constructor(email:string){
        // NOTE: this is only an example. But uuidv4() SHOULD NOT BE HERE 
        this.id = uuidv4();
        
        this.email = email;
        this.lastSigin = new Date();
    }
}

export enum UserStatus{
    DEFAULT = 0,
    SEARCHING = 1,
    PLAYING = 2
}