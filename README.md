### Web Game Server

This is a prof of concept to a web game server, we'll have 3 different projects:
- api: Easy eapy with some JWT authentication, and to search game
- match_orchestrator: this Orchestrator will be in charge to group users, create match, and send user the new ip node to connect to the match
- match: The match or game server, that will allow users to play the game

That is the server part, but also we'll have games (UI), to start this demo I'll added a simple pong game, to play 2 players.


### Technologies
For this project we'll use Nestjs & RabbitMQ.