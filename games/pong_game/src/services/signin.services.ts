


export interface SigninService {
    signin(email:string):boolean

    searchGame():void

    get token():string;
}


export class SigninBusiness implements SigninService {
    
    private _token:string = null;
    constructor(){

    }

    signin(email: string): boolean {
        // TODO: call services

        if(true){
            this._token = "some token";
        }

        return true;
    }

    searchGame(): void {
        // call service with token    
    }

    get token(): string {
        return this._token;
    }

    
}