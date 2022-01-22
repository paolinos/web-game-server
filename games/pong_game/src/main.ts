import * as PIXI from 'pixi.js'
import { GameEngine } from './render/game.engine';

const app = new GameEngine();

const container = new PIXI.Container();
app.stage.addChild(container);

const graphicsContainer = new PIXI.Graphics();

// Rectangle
graphicsContainer.lineStyle(2, 0xFEEB77, 1);
graphicsContainer.beginFill(0x650A5A);
graphicsContainer.drawRect(200, 50, 100, 100);
graphicsContainer.endFill();
container.addChild(graphicsContainer);



const graphics = new PIXI.Graphics();

// Circle
graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
graphics.beginFill(0xDE3249, 1);
graphics.drawCircle(100, 250, 50);
graphics.endFill();

app.stage.addChild(graphics);


// Listen for animate update
app.ticker.add((delta) => {
    container.rotation -= 0.01 * delta;
});