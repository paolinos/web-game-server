import { createServer, Server } from 'http';   //from 'https' USE https
import { WebSocket, WebSocketServer } from 'ws';
import  * as EventEmitter from 'events';

const TOKEN_KEY = "Bearer, ";
const PORT = 8100;

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



export class WebsocketConn extends EventEmitter {
    
    private readonly _server:Server;
    private readonly _wss:WebSocketServer;
    private readonly _clients:{ [id: string]: WebSocket } = {};

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
            this._server.listen(PORT, () => {
                console.log("Running at port:", PORT);
            });
        }

        this._server.on('upgrade', function upgrade(request, socket, head) {

            const auth = request.rawHeaders.find(q => q.includes(TOKEN_KEY));
            if(auth){
                const tokenResult = getToken(auth);
                if(tokenResult.err){
                    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                    socket.destroy();
                }
            }
        });
    }

    private setWebsocketServerListeners(){
        this._wss.on('connection', this.onWWSConnection.bind(this));
        this._wss.on("error", this.onWSSError);
        this._wss.on('close', this.onWSSClose);
    }

    private onWWSConnection(ws:WebSocket){
        const tokenResult = getToken(ws.protocol);
        this.addWebsocketClient(ws, tokenResult.token);
    }

    private onWSSError(error){
        console.log("error", error);
    }
    private onWSSClose(){
        console.log("Close");
    }



    private addWebsocketClient(ws:WebSocket, token:string){
        //
        this._clients[token] = ws;
        this.emit(WebsocketConnEvent.CONNECTED);
        ws.on('message', (data) => {
            this.emit(WebsocketConnEvent.MESSAGE, data.toString());
        });

        ws.on("close", () => {
            console.log("Close");
        })
        ws.on("error", (error) => {
            console.log("error", error);
        })
    }
}