### Web Game Server - TODO: review description
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


**Diagram:**
![Messages Workflow](/documents/sequence-diagram.png)


### Commits
I'll use hashtag to identify all commit for each project 
- #web
- #match