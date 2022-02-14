export enum UserStatus {
    NONE=0,
    CONNECTED=1,
    READY=2,
    PLAYING=3,
    DISCONNECTED=9
}

export class User {
    public username:string;
    public token:string;
    public points:number;
    public status:UserStatus;
}