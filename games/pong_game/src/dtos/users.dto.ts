
export class PlayerDto{
    public username:string = "";
    public points:number = 0; 
}

export class UpdateUserMessage{
    public players:PlayerDto[] = [];
}
