import { UserInformation } from '../../domain/user';

export class UserDto implements UserInformation{
    public userId:string;

    public username:string;

    public points:number = 0;

    public get id(): string {
        return this.userId;
    }

    public get email() : string {
        return this.username;
    }
}