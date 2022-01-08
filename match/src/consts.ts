//  RabbitMQ
export const RABBIT_HOST:string="localhost";
export const RABBIT_PORT:number=5672;

export const RABBIT_QUEUE_APP:string="game-queue-app";
export const RABBIT_QUEUE_MATCH:string="game-queue-match";


export enum MatchStatus{
    STAND_BY = 0,
    WAITING_PLAYERS = 1,
    PLAYING = 2,
    END_GAME = 3
}