import { Container } from 'pixi.js'

import { BoundingBoxArea } from "./boundingbox.area";


export interface BoundingBox {
    get area():BoundingBoxArea;
}

/**
 * Minimun object renderable
 */
export abstract class RenderableObject{
    protected readonly _container:Container;

    constructor(){
        this._container = new Container();
    }

    get x():number{
        return this._container.x;
    }

    get y():number{
        return this._container.y;
    }

    get container():Container{
        return this._container;
    }

    setPos(x:number, y:number):void {
        this._container.position.set(x,y);
    }

    show():void{
        this._container.visible = true;
    }
    hide():void{
        this._container.visible = false;
    }

} 

/**
 * Minimun object collidable renderable 
 */
export abstract class RenderableCollisionObject extends RenderableObject implements BoundingBox{
    
    get area(): BoundingBoxArea {
        return new BoundingBoxArea(
            this._container.x,
            this._container.y,
            this._container.width,
            this._container.height
        );
    }

    abstract update(delta:number):void;
} 