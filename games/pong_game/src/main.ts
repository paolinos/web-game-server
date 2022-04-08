import { PongGame } from './game/pong.game';
import { Game } from './game/base';
import { SigninService, SigninBusiness } from './services/signin.services';
import { io } from "socket.io-client";
import { PlayerDto, UpdateUserMessage } from './dtos/users.dto';

// TODO: 
//  - signin screen
//      - call api and get token
//      - connect WS & display a button to search game
//      - get points of user
//      - receive WS to play a game
//  - connect to WS game
//  - start game
//      - ball direction should come from Server
//      - send events by WS for movement
//      - validate points in both sides

const HOST:string = "localhost";


const getRandomInt = (): number => {
    const max = 100000;
    return Math.floor(Math.random() * max);
}

// TODO: move this to sigin page/view
const siginSrv:SigninService = new SigninBusiness();
const username = `some${getRandomInt()}@email.com`;
siginSrv.signin(username);


// TODO: Move this to game page/view
const socket = io(`ws://${HOST}:8000`, {
    transports: ["websocket"],
    path: '/match-id',
    autoConnect: false,
    auth: {
       token:  siginSrv.token
    }
});

let game:Game = null;
const createGame = () => {
    if(!game){
        game = new PongGame(username);
    }

    socket.emit('ready');
}


socket.on("connect", () => {  
    console.log("connect", socket.id);
    createGame(); 
});
socket.on("connect_error", (e) => {
    console.log("connect_error", e, socket);
});
socket.on("disconnect", () => {  
    console.log("disconnect", socket.id);

    // TODO: pause game and waiting for re-connection
});

socket.on('test-event', (e:any) => {
    console.log("test-event", e);
});

socket.on('start_game', (e:UpdateUserMessage) => {
    console.log('start_game', e);

    game.start(e.players);
})
socket.connect();