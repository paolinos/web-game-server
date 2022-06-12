import { createServer, IncomingMessage, Server } from 'http';   //from 'https' USE https
import { WebSocket, WebSocketServer } from 'ws';
import  * as EventEmitter from 'events';
import { WS_PORT } from '../../consts';
import { parseToken, UserSession } from '../../tools/token.tools';

const TOKEN_KEY = "Bearer,";


const server = createServer()
const wss = new WebSocketServer({ server });

const getToken = (authorization:string|undefined):{err:boolean, token:string|null} => {
    const auth = authorization || "";
    if(!auth.startsWith(TOKEN_KEY)){
        return {err:true,token:"Unauthorized"};
    }

    const token = auth.substring(TOKEN_KEY.length)
    if(token.length <= 3 || token.length > 300){
        return {err:true,token:"Unauthorized. Invalid token"};
    }


    return {err:false, token};
}

export enum WebsocketConnEvent {
    CONNECTED= "ws-client-connected",
    MESSAGE= "ws-client-message"
}

const checkUserAuthorization = (request:IncomingMessage) => {
    const auth = request.rawHeaders.find(q => q.includes(TOKEN_KEY));
    if(!auth) return null;

    const tokenResult = getToken(auth);
    if(tokenResult.err) return null;

    return parseToken(tokenResult.token); 
}


export interface IWebsocketConn {
    acceptConnections(value:boolean):void;

    sendMessageToOthers(currentUserEmail:string, value:any):void;

    sendMessageToAll(value:any):void;

    // from EventEmitter
    on(eventName: string | symbol, listener: (...args: any[]) => void):this;
}

export class WebsocketConn extends EventEmitter implements IWebsocketConn {
    
    private readonly _server:Server;
    private readonly _wss:WebSocketServer;
    private readonly _clients:{ [id: string]: WebSocket } = {};

    private _acceptConnection:boolean = false;

    private _clientSocket:Record<string, string> = {};

    constructor(server:Server|null = null){
        super();

        let runServer = false;
        this._server = server;
        if(this._server === null){
            this._server = createServer();
            runServer = true;
        }
        
        this._wss = new WebSocketServer({ server: this._server });
        this.setWebsocketServerListeners();

        // TODO: better add an 'autoconnect' prop?
        if(runServer){
            this._server.listen(WS_PORT, () => {
                console.log("Running at port:", WS_PORT);
            });
        }

        this._server.on('upgrade', (request, socket, head) =>  {
            let disconnect = true;

            if(this._acceptConnection){
                const tokenData = checkUserAuthorization(request);
                // TODO: validate if tokenData.email is user that need to connect
                disconnect = tokenData === null;
            }

            if(disconnect){
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
            }
        });
    }

    public acceptConnections(value:boolean):void {
        this._acceptConnection = value;
    }

    public sendMessageToOthers(currentUserEmail: string, value: any): void {
        const ws = this._clients[currentUserEmail];
        if(!ws){
            console.warn('User not exist in the connection. wrong Email');
            return;
        }

        ws.send(value);
    }

    public sendMessageToAll(value: any): void {
        for (const userEmail in this._clients) {
            const ws = this._clients[userEmail];
            ws.send(value);
        }
    }


    private setWebsocketServerListeners(){
        this._wss.on('connection', this.onWWSConnection.bind(this));
        this._wss.on("error", this.onWSSError);
        this._wss.on('close', this.onWSSClose);
    }

    private onWWSConnection(ws:WebSocket, request:IncomingMessage){
        
        const tokenResult = checkUserAuthorization(request);
        this.addWebsocketClient(ws, tokenResult);
    }

    private onWSSError(error){
        // TODO:
        console.log("error", error);
    }
    private onWSSClose(){
        // TODO:
        console.log("Close");
    }



    private addWebsocketClient(ws:WebSocket, user:UserSession){
        this._clients[user.email] = ws;
        this.emit(WebsocketConnEvent.CONNECTED, user);
        ws.on('message', (data) => {
            this.emit(WebsocketConnEvent.MESSAGE, user, data.toString());
        });

        ws.on("close", () => {
            // TODO:
            console.log("Close");
        })
        ws.on("error", (error) => {
            // TODO:
            console.log("error", error);
        })
    }
}