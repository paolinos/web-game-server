### Web Game Server

This is a prof of concept to a web game server, we'll have 3 different projects:
- api: Easy eapy with some JWT authentication, and to search game
- match_orchestrator: this Orchestrator will be in charge to group users, create match, and send user the new ip node to connect to the match
- match: The match or game server, that will allow users to play the game

That is the server part, but also we'll have games (UI), to start this demo I'll added a simple pong game, to play 2 players.



### Technologies
For this project we'll use Nestjs & RabbitMQ.

### Messages
![Messages Workflow](/documents/messages-workflow.jpg)




#### Docker scripts

**ONLY FOR DEVELOPMENT**
```bash

# Create RabbitMQ container
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