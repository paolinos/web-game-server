import { Graphics, Text } from "pixi.js";
import { Point } from "../game/base";

/**
 * Create a rectangle graphics
 * @param {number} width 
 * @param {number} height 
 * @param {number} color  
 * @param {number} x (optional)
 * @param {number} y (optional)  
 * @returns {PIXI.Graphics}
 */
export const createRectGraphics = (width:number, height:number, color:number=0xFFFFFF, x:number = 0, y:number = 0):Graphics => {
    const graph = new Graphics();
    graph.beginFill(color);
    graph.drawRect(x, y, width, height);
    graph.endFill();
    return graph;
}

/**
 * 
 * @param {Point} from 
 * @param {Point} to 
 * @param {number} color
 * @returns {PIXI.Graphics} 
 */
export const createLineGraphics = (from:Point, to:Point, color:number=0xFFFFFF):Graphics => {
    const graph = new Graphics();
    graph.lineStyle(1, color).moveTo(from.x, from.y).lineTo(to.x, to.y);
    return graph;
}

/**
 * Create default text
 * @param {string} text 
 * @param {number} color 
 * @returns {PIXI.Text}
 */
export const createText = (text:string, color:number=0xFFFFFF):Text => {
    return new Text(
        text,
        {
            fontFamily: 'Arial', 
            fontSize: 14, 
            fill: color, 
            align : 'center'
        }
    );
}