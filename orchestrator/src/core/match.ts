import { UserDto } from './user.dto';
import { MatchStatus } from '../consts';

export class Match{
    public id:string;

    public users:UserDto[] = [];

    public status:MatchStatus = MatchStatus.STAND_BY;

    constructor(users:UserDto[]){
        // TODO: temp id
        this.id = `match-${Date.now()}-${Math.floor(Math.random() * 10000000)}`;
        this.users = users;
    }
}

