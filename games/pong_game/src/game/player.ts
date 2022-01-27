import { Container } from "pixi.js";
import { createRectGraphics } from "../render/render.help";
import { HEIGHT } from "./base";
import { BoundingBoxArea } from "./boundingbox.area";
import { RenderableCollisionObject } from "./renderable.object";

const ACCELERATION:number = 10;
const PADDLE_WIDTH:number = 10;
const PADDLE_HEIGHT:number = 50;
const PADDLE_QUARTER:number = PADDLE_HEIGHT * 0.5;


enum PlayerMove {
    None,
    Up,
    Down
}

export class Player extends RenderableCollisionObject {

    // TODO: points is not part of Rendereableobjects. we need to move this points. Only rendering and actions
    private _points:number = 0;
    private _move:PlayerMove = PlayerMove.None;

    constructor(){
        super();

        this._container.addChild(createRectGraphics(PADDLE_WIDTH, PADDLE_HEIGHT)); 
        // Set pivot in the center
        this._container.pivot.set(PADDLE_WIDTH * 0.5, PADDLE_HEIGHT * 0.5);
    }

    get points():number {
        return this._points;
    }

    setGoal(){
        this._points += 1;
    }

    moveUp(){
        this._move = PlayerMove.Up;
    }

    moveDown(){
        this._move = PlayerMove.Down;
    }

    moveStop(){
        this._move = PlayerMove.None;
    }

    update(delta: number) {
        if(this._move === PlayerMove.None) return;

        let direction:number = 1;
        if(this._move === PlayerMove.Up){
            direction = -1;
        }

        const tmpY = this.container.position.y + (direction * delta * ACCELERATION );
        if(tmpY - PADDLE_QUARTER > 0 && tmpY + PADDLE_QUARTER < HEIGHT) {
            this.container.position.y = tmpY;
        }
    }
}