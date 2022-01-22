

export const WIDTH:number = 800;
export const HEIGHT:number = 600;
export const HALF_WIDTH:number = WIDTH * 0.5;
export const HALF_HEIGHT:number = HEIGHT * 0.5;

export interface Game{
    start():void;
    stop():void;
}

export class Point{
    public x:number = 0;
    public y:number = 0;
}