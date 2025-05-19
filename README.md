# Web Game Server

## Getting started
WebGameServer requires Go version 1.23 or above.
Libraries:
- Gin: Web framework 
- Gorilla: WebSocket
- Nats: Key/Value storage, PubSub/Queue

### Sequence Diagram

```mermaid
sequenceDiagram
    actor device
    participant Web
    participant GameServer
    participant Nats

    device -)+ Web: POST /signin {email:string passsword: string }
    Web-) Nats: check DB and generate token
    Web--)- device: { token: string }

    device -)+ Web: GET /dashboard with token
    Web-) Nats: check token
    Web-) Nats: get user information
    Web--)- device: return user information (points, played games, etc)

    device ->>+ Web: GET /sse (server-sent events)
    device -)+ Web: POST /search-match
    Web-) Nats: Storage fata into DB
    Web--)- device: after have all user return match information
    Web-) Nats: Notify GameServer about Match information and users
    Web--)- device: close SSE


    device ->>+ GameServer: GET /ws Connect to Websocket
    GameServer --) device: All users connected
    GameServer --) device: start game
    loop Game Loop. Every X s/ms
        device-->GameServer: device send update, and also recieve other device update
    end
    GameServer --) device: End Game Or time out or one of the player won
    GameServer --) Nats: Notify Web with the result of the match, points of users and all game information
    GameServer ->>- device: disconnect WS

```

### Projects

- [Web Project](#web-project)


#### Web Project
Web project it's a web server, with some api endpoints, and Server Side Event.

```sh
cd web

go run ./cmd/web.go
```


### TODO:
<style>
r { color: Red }
o { color: Orange }
g { color: Green }
</style>

- working in [Common](./common/)
    - <o>[x] Progress:</o> Common with Server Sent Event Example
    - <o>[ ] TODO:</o> Common with Websocket example
    - <r>[ ] TODO:</r> Common with Nats example (Queue, Pubsub, Key/Value)
    - <r>[ ] TODO:</r> Start with API in Golang
    - <r>[ ] TODO:</r> Start with GameServer in Golang
    - <r>[ ] TODO:</r> Create basic TicTacToe game puse js


