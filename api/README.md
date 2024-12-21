## Web

Basic web app, that will contain a base web alication with websocket + an api.
We're using:
- Typescript (and building with SWC)
- ExpressJS (Web Framework)
- Inversify (Inversion Of Controll)
- Test Jest & SWC
- Biome as Linter

**Scripts:**

```sh
#---------- Install
$ npm install

#---------- Test
# Run Unit tests
$ npm run test

# Run e2e tests
$ npm run test:e2e


#---------- Run
$ npm run dev
```

### Full Sequence Diagram
```mermaid
sequenceDiagram
actor Client
box rgb(100, 178, 255) Services 
participant WebServer
participant GameServer
end

GameServer-->>WebServer: PubSub "game:init"

Client->>+WebServer: load page GET /web
WebServer-->>-Client: return page

Client->>+WebServer: connect user POST /auth
WebServer-->>-Client: return token

Client->>WebServer: WS connection /

Client-->>WebServer: WS "auth:{TOKEN}"
activate WebServer
alt Auth success
    WebServer-->>Client: return "auth:success"
else Unauthorized, disconnect
    WebServer-->>Client: disconnect WS
end
deactivate WebServer

Client-->>WebServer: WS "search:match"
activate WebServer
Note right of WebServer: MatchMaker<br/> will check the amount of players to send "search:match:game:{MATCH-ID}".<br/> If after X time no player will send a "search:match:timeout"
alt Found oher players
    WebServer-->>Client: return "search:match:game:{MATCH-ID}"
    WebServer-->>GameServer: set match with players
else Timeout
    WebServer-->>Client: "search:match:timeout"
end
deactivate WebServer

Client->>GameServer: WS connection /
activate GameServer
WebServer->>Client: WS disconnect
Client-->>GameServer: WS "auth:{TOKEN}"
Note right of GameServer: After each players are authenticated, server will send an event "user:status" to all clients
Note right of GameServer: After all players connected, server will send the start notification "game:start"
GameServer-->>Client: WS "game:start"
GameServer-->>Client: WS "game:update"
Note right of GameServer: After authentication, client are going to start the game, and send update events to notify other players, depends of the game the events
Client->>GameServer: WS "game:update"
GameServer-->>Client: WS "game:update"
GameServer-->>Client: WS "game:end"
GameServer-->>WebServer: PubSub "match:update"
deactivate GameServer

GameServer->>Client: WS disconnect
```







