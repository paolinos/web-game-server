import { Game, HALF_HEIGHT, HALF_WIDTH } from "./base";
import { Player } from "./player";
import { GameEngine } from '../render/game.engine';
import { GameLayout } from "./game.layout";
import { Ball } from "./ball";
import { checkBBCollision } from './boundingBox.collision';
import { HEIGHT, WIDTH } from "./base";

const PADDLE_SPACE:number = 25;

export class PongGame implements Game {

    private readonly _app:GameEngine;
    private readonly _layout:GameLayout;
    private readonly _playerOne:Player;
    private readonly _playerTwo:Player;
    private readonly _ball:Ball;

    // TODO:
    private readonly _currentPlayer:Player;

    constructor(){
        this._app = new GameEngine(WIDTH, HEIGHT);

        this._layout = new GameLayout("Player One", "Player Two");
        this._app.stage.addChild(this._layout.container);

        this._playerOne = new Player();
        this._playerOne.setPos(PADDLE_SPACE, HALF_HEIGHT);
        this._app.stage.addChild(this._playerOne.container);

        this._playerTwo = new Player();
        this._playerTwo.setPos(WIDTH - PADDLE_SPACE, HALF_HEIGHT);
        this._app.stage.addChild(this._playerTwo.container);

        this._ball = new Ball();
        this._app.stage.addChild(this._ball.container);

        //
        this._currentPlayer = this._playerOne;
    }


    start(): void {

        // TODO:
        // Listen for animate update
        this._app.ticker.add((delta) => {

            this._playerOne.update(delta);
            this._playerTwo.update(delta);
            this._ball.update(delta);

            if(
                checkBBCollision(this._ball.area, this._playerOne.area) || 
                checkBBCollision(this._ball.area, this._playerTwo.area)
            ){
                this._ball.collisionWithPaddle();
            }

            if(this._ball.x < 0){
                this._playerTwo.setGoal();
                this._layout.updatePlayerTwoPoints(this._playerTwo.points);
                this._ball.resetPos();
            }else if(this._ball.x > WIDTH){
                this._playerOne.setGoal();
                this._layout.updatePlayerOnePoints(this._playerOne.points);
                this._ball.resetPos();
            }

        });
        this.startListener();
        this._ball.resetPos();
    }

    stop(): void {
        this.stopListener();
    }

    private startListener()
    {
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    private stopListener(){
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
    }

    private onKeyDown(e:KeyboardEvent) {
        if(e.key === "ArrowUp"){
            this._currentPlayer.moveUp();
        }else if(e.key === "ArrowDown"){
            this._currentPlayer.moveDown();
        }
    }
    private onKeyUp(e:KeyboardEvent) {
        if(e.key === "ArrowUp" || e.key === "ArrowDown"){
            this._currentPlayer.moveStop();
        }
    }
}