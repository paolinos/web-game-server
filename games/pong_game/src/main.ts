import { PongGame } from './game/pong.game';
import { Game } from './game/base';

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


const game:Game = new PongGame();
game.start();