export class UserDto{
    
    public readonly email:string;

    public readonly points:number;

    constructor(
        email:string, 
        points:number
    ) {
        this.email = email;
        this.points = points;
    }
}