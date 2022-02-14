import {User} from './user';

export class Match {
    public readonly gameId:string;
    public readonly gameName:string;

    public id:string;

    public users:User[] = [];

    public status:string = "";

    constructor(){
        // TODO: remove this
        this.gameId = "GAME-ID-RAMDOM-" + Date.now();
        this.gameName = "Pong";
    }
}