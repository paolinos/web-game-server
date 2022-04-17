import { UserSession } from "./userSession.interface";
import {ObjectResult} from '../objectResult';

export interface AuthService{

    signIn(email:string):Promise<ObjectResult<UserSession>>;
}