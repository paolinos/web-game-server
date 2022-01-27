import * as PIXI from 'pixi.js'

export class GameEngine {
    
    private readonly app:PIXI.Application;
    
    constructor(width:number, height:number,view:HTMLCanvasElement = null){

        let renderOptions:PIXI.IApplicationOptions = {
            width, 
            height, 
            backgroundColor: 0x1099bb, 
            resolution: window.devicePixelRatio || 1, 
            antialias: true
        }
        if(view){
            renderOptions.view = view;
        }
        this.app = new PIXI.Application(renderOptions);

        if(!view){
            document.body.appendChild(this.app.view);
        }
    }

    get stage():PIXI.Container{
        return this.app.stage;
    }

    get ticker():PIXI.Ticker{
        return this.app.ticker
    }

    get view():HTMLCanvasElement{
        return this.app.view;
    }
}