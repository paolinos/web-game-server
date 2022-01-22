import { createRectGraphics } from "../render/render.help";
import { HALF_HEIGHT, HALF_WIDTH, HEIGHT, Point } from "./base";
import { BoundingBoxArea } from "./boundingbox.area";
import { RenderableCollisionObject } from "./renderable.object";

const AREA:number = 10;

export class Ball extends RenderableCollisionObject {

    private readonly _direction:Point;
    private _speed:number = 1;


    constructor(){
        super();

        this._direction = new Point();
        this._direction.x = 1;
        this._direction.y = 1;

        this._container.addChild(createRectGraphics(AREA, AREA, 0xffce3d));
        // Set pivot in the center
        this._container.pivot.set(AREA * 0.5, AREA * 0.5);
    }

    resetPos(){
        this.setPos(HALF_WIDTH, HALF_HEIGHT);
        this._direction.x *= -1;
    }

    collisionWithPaddle():void{
        this._direction.x *= -1;
    }
    
    update(delta: number) {
        // Calculate new pos
        let tmpX = this._direction.x * this._speed * delta;
        let tmpY = this._direction.y * this._speed * delta;
        const nextY = this.container.y + tmpY;
        
        if(nextY < 0 || nextY > HEIGHT){
            this._direction.y *= -1;
            tmpY *= -1;
        }

        this._container.x += tmpX;
        this._container.y += tmpY;
    }
}