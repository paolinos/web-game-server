
/**
 * BoundingBox Area
 */
export class BoundingBoxArea{
    public readonly x:number;
    public readonly y:number;
    public readonly width:number;
    public readonly height:number;

    /**
     * @param x left
     * @param y top
     * @param width 
     * @param height 
     */
    constructor(x:number, y:number, width:number, height:number){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}