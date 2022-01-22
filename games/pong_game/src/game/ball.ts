import { createRectGraphics } from "../render/render.help";
import { Point } from "./base";
import { RenderableCollisionObject } from "./renderable.object";

const AREA:number = 10;

export class Ball extends RenderableCollisionObject {

    private readonly _direction:Point;
    private _speed:number = 1;


    constructor(){
        super();

        this._direction = new Point();

        this._container.addChild(createRectGraphics(AREA, AREA));
        // Set pivot in the center
        this._container.pivot.set(AREA * 0.5, AREA * 0.5);

    }

    update(delta: number) {
        // TODO: update
    }
}