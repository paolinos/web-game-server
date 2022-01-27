import { BoundingBoxArea } from './boundingbox.area';

/**
 * Check bounding box collision between two areas
 * **Remember:** x & y are in top left of the object.
 * @param areaA BoundingBoxArea object one
 * @param areaB BoundingBoxArea object two
 * @returns 
 */
export const checkBBCollision = (areaA:BoundingBoxArea, areaB:BoundingBoxArea):boolean => {
    return (
        areaA.x < (areaB.x + areaB.width) &&
        (areaA.x + areaA.width) > areaB.x &&
        areaA.y < (areaB.y + areaB.height) &&
        (areaA.height + areaA.y) > areaB.y
    );
}