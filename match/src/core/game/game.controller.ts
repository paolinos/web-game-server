/*
import { Controller } from '@nestjs/common';

import { GameBase } from './game.base';
import { GameGateway, SocketEvent, WS_EVENTS } from './game.gateway';
import { MatchRepository } from '../../repositories/match.repository';
import { UserStatus } from '../../models/entities/user';
import { UserMatchReadyDto } from '../../models/dto/user.dto';

 * This controller will run as Service
 * Just is a controller because of Nestjs configuratons.

const TIME_GAME:number = 10000;

@Controller()
export class GameController extends GameBase  {

    private intervalTime:NodeJS.Timer;

    constructor(
        ws:GameGateway,
        private readonly matchRepo: MatchRepository
    ){ 
        super(ws);
    }

    checkAuth(token:string):boolean{
        // TODO: check token
        return true;
    }

    onPlayerConnected(e:SocketEvent):void {
        console.log("onPlayerConnect", e);

        this.matchRepo.addUser(e.username, e.token);
    }

    onPlayerDisconnected(e:SocketEvent):void {
        console.log("onPlayerDisconnect", e);

        this.matchRepo.updateUserStatus(e.username, UserStatus.DISCONNECTED);
    }

    onReady(e:SocketEvent):void {
        console.log("onReady", e);

        this.matchRepo.updateUserStatus(e.username, UserStatus.READY);

        const usersReady = this.matchRepo.getUsersWithStatus(UserStatus.READY);
        console.log("usersReady", usersReady);
        if(usersReady.length >= 2){
            // We have 2 users to plays
            const players = usersReady.slice(0, 2);
            console.log("Players to play:", players);

            //Update status
            this.matchRepo.updateUserStatusFromUsers(players, UserStatus.PLAYING);

            // Notify users
            this._ws.sendEventToUsers('start_game', players, new UserMatchReadyDto(players) );

            this.intervalTime = setTimeout(this.timeOver.bind(this), TIME_GAME);
        }
    }

    onUpdate(e:SocketEvent):void {
        console.log("onUpdate", e);
    }

    onEndGame(e:SocketEvent):void {
        
        // Disconnect
        this.matchRepo.updateUserStatus(e.username, UserStatus.NONE);
        //this.mathRepo.updateAllUserStatus(UserStatus.NONE);
    }


    private timeOver():void {
        clearTimeout(this.intervalTime);
        console.log("Time Over");
        this._ws.server.emit("game-over");
    }
}
*/