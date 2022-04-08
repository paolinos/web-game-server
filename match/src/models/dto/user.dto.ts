import { User } from "../entities/user";


export class PlayerDto{
    constructor(
        public username:string = "",
        public points:number = 0
    ){ }
}

export class UserMatchReadyDto{
    
    public players:PlayerDto[] = [];

    constructor(users:User[]){

        for (const user of users) {
            this.players.push(
                new PlayerDto(user.username, user.points)
            );
        }    
    }
}