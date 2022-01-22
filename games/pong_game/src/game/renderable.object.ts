import { Container, Graphics } from 'pixi.js'

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

    abstract update(delta:number);
} 

/**
 * Create a rectangle graphics
 * @param {number} width 
 * @param {number} height 
 * @param {number} color  
 * @param {number} x (optional)
 * @param {number} y (optional)  
 * @returns {Graphics}
 */
export const createRectGrahpics = (width:number, height:number, color:number=0xFFFFFF, x:number = 0, y:number = 0) => {
    const graph = new Graphics();
    graph.beginFill(color);
    graph.drawRect(x, y, width, height);
    graph.endFill();
    return graph;
}