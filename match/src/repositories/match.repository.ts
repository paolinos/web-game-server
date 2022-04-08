import {User, UserStatus} from '../models/entities/user';
import {Match} from '../models/entities/match';

export class MatchRepository {
    private readonly _current:Match;

    constructor(){
        this._current = new Match();
    }

    loadMatch(id:string, users:User[], status:string):void{
        this._current.id = id;
        this._current.users = users;
        this._current.status = status;
    }

    addUser(username:string, token:string):void {
        let user = this._current.users.find(q => q.username === username);
        if(!user){
            user = new User();
            user.username = username;
            user.token = token;
            user.status = UserStatus.CONNECTED;
            user.points = 0;

            this._current.users.push(user);
        }
    }

    updateUserStatus(username:string, status:UserStatus):void {
        const user = this._current.users.find(q => q.username === username);
        if(user){
            user.status = status;
        }
    }

    /**
     * Return a copy Users with that status
     * @param status UserStatus
     * @returns {User[]}
     */
    getUsersWithStatus(status:UserStatus):User[] {

        return this._current.users.filter(q => q.status === status).slice(0);
    }

    updateUserStatusFromUsers(users:User[], status:UserStatus):void{

        for (const user of users) {
            var tmpUser = this._current.users.find(q => q.username === q.username);
            if(!tmpUser){
                throw new Error("User not exist. You are trying to change the status of user that not exist.");
            }

            tmpUser.status = status;
        }
    }

    get gameId():string {
        return this._current.gameId;
    }

    get gameName():string {
        return this._current.gameName;
    }
}