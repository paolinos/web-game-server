import { UserSession } from "./userSession.interface";


export interface AuthService{

    signIn(email:string):Promise<UserSession>;
}