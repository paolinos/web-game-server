import { WebsocketConn, WebsocketConnEvent } from './ws';
import { MatchBusinessLogic, MatchService } from '../application/services/match.service'

const socketServer = new WebsocketConn();
socketServer.on(WebsocketConnEvent.CONNECTED, () => {
    console.log("WebsocketConnEvent.CONNECTED");
})
socketServer.on(WebsocketConnEvent.MESSAGE, (data) => {
    console.log("WebsocketConnEvent.MESSAGE", data);
})


const matchService:MatchService = new MatchBusinessLogic();
matchService.ready();
