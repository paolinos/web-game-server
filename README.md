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
    participant Api
    participant GameServer
    participant Nats

    device -)+ Api: POST /signin {email:string passsword: string }
    Api-) Nats: check DB and generate token
    Api--)- device: { token: string }

    device -)+ Api: GET /dashboard with token
    Api-) Nats: check token
    Api-) Nats: get user information
    Api--)- device: return user information (points, played games, etc)

    device ->>+ Api: GET /sse (server-sent events)
    device -)+ Api: POST /search-match
    Api-) Nats: Storage fata into DB
    Api--)- device: after have all user return match information
    Api-) Nats: Notify GameServer about Match information and users
    Api--)- device: disconnect WS


    device ->>+ GameServer: GET /ws Connect to Websocket
    GameServer --) device: All users connected
    GameServer --) device: start game
    loop Game Loop. Every X s/ms
        device-->GameServer: device send update, and also recieve other device update
    end
    GameServer --) device: End Game Or time out or one of the player won
    GameServer --) Nats: Notify Api with the result of the match
    GameServer ->>- device: disconnect

```


### TODO:
<style>
r { color: Red }
o { color: Orange }
g { color: Green }
</style>

- working in [Common](./common/)
    - <g>DONE:</g> Common with Server Sent Event Example
    - <o>TODO:</o> Common with Websocket example
    - <r>TODO:</r> Common with Nats example (Queue, Pubsub, Key/Value)
    - <r>TODO:</r> Start with API in Golang
    - <r>TODO:</r> Start with GameServer in Golang
    - <r>TODO:</r> Create basic TicTacToe game puse js
    