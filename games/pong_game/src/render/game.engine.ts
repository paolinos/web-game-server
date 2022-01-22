import * as PIXI from 'pixi.js'

export class GameEngine {
    
    private readonly app:PIXI.Application;
    
    constructor(view:HTMLCanvasElement = null){

        let renderOptions:PIXI.IApplicationOptions = {
            width: 800, 
            height: 600, 
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
}