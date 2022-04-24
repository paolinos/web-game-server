### Web Game Server
Web game server is a prof of concept of simple server for game.\
Se we create different services that for each part.\
Services:
- api: Rest API,for sigin, search/cancel search game, and get points. 
- orchestrator: PubSub that will received user to find a match, create the match and let it's play. Also will connect with the game-servers
- match: The match or game server, that will allow users to play the game.

**NOTE:** match will be renamed as game-server, to differenciate that\
- `game-server` is the server running. and be able to host multiples matchs (one match at time) 
- `match` match is the instance of a game, that will run in a game-server with a list of players and will have and start & end.

That is the server part, but also we'll have games (UI), to start this demo I'll added a simple pong game, to play 2 players.


### Messages
![Messages Workflow](/documents/messages-workflow.jpg)




#### Docker scripts

**ONLY FOR DEVELOPMENT**
```bash

# Create RabbitMQ container
docker container run -d --rm --net=host --name rabbit.dev rabbitmq:3

docker container run -d --net=host --name rabbit.dev rabbitmq:3

# Create NodeDev container - Powershell
docker container run -it --net=host  -w /apps -v ${PWD}:/apps --name web-game-server.dev node:current-alpine sh
# Create NodeDev container - Linux
docker container run -it --net=host  -w /apps -v $(pwd):/apps --name web-game-server.dev node:current-alpine sh
```
Docker commands:
```bash
# Start container 
docker container start {container-name}
#       Ex.:    docker container start rabbit.dev
#       Ex.:    docker container start web-game-server.dev

# Get inside container:
docker container exec -it {container-name} {command}
#       Ex.:    docker container exec -it web-game-server.dev sh
```


### Commits
I'll use hashtag to identify all commit for each project 
- #api
- #orchestrator
- #match            - Match/Game Server
- #game             - frontend that will connect with API & Match/GameServer