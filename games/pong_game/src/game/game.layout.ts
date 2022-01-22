import { Text } from "pixi.js";
import { createLineGraphics, createText } from "../render/render.help";
import { HALF_HEIGHT, HALF_WIDTH, HEIGHT, Point, WIDTH } from "./base";
import { RenderableObject } from "./renderable.object";


class PlayerLayout extends RenderableObject {
    
    private readonly _name:Text;
    private readonly _points:Text;

    constructor(name:string){
        super();

        this._name = createText(name);
        this._container.addChild(this._name);

        this._points = createText("0");
        this._points.y = this._name.height;
        this._container.addChild(this._points);
    }

    set point(value:number){
        this._points.text = value.toString();
    }
}



export class GameLayout extends RenderableObject {

    private readonly _player1:PlayerLayout;
    private readonly _player2:PlayerLayout;

    constructor(name1:string, name2:string){
        super();

        this._player1 = new PlayerLayout(name1);
        this._player1.setPos(HALF_WIDTH * 0.5, 10);
        this._container.addChild(this._player1.container);

        this._player2 = new PlayerLayout(name2);
        this._player2.setPos(HALF_WIDTH + (HALF_WIDTH * 0.5), 10);
        this._container.addChild(this._player2.container);

        this._container.addChild(createLineGraphics({x: HALF_WIDTH, y:0 }, {x:HALF_WIDTH, y: HEIGHT}));
        this._container.addChild(createLineGraphics({x: 0, y:HALF_HEIGHT }, {x:WIDTH, y: HALF_HEIGHT}));
    }

    updatePlayerOnePoints(value:number):void{
        this._player1.point = value;
    }

    updatePlayerTwoPoints(value:number):void{
        this._player2.point = value;
    }
}