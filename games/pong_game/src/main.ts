import * as PIXI from 'pixi.js'

console.log("Hello");

// Prepare area
const app = new PIXI.Application({
    width: 800, height: 600, 
    backgroundColor: 0x1099bb, 
    resolution: window.devicePixelRatio || 1, 
    antialias: true 
});
document.body.appendChild(app.view);


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