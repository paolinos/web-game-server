//  RabbitMQ
export const RABBIT_HOST:string="localhost";
export const RABBIT_PORT:number=5672;
export const RABBIT_DURABLE = false;

// JWT
export const JWT_SECRET:string="jwt-secret";

export const RABBIT_QUEUE_APP:string="game-queue-app";
export const RABBIT_QUEUE_MATCH:string="game-queue-match";

export const GAME_TYPE:string = "PONG";
export const GAME_PLAYERS:number = 2;
export const MATCH_ID:string = `MATCH-${Math.round(Math.random() * 1000000)}`;

export enum MatchStatus{
    STAND_BY = 0,
    WAITING_PLAYERS = 1,
    PLAYING = 2,
    END_GAME = 3
}