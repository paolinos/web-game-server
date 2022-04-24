//  RabbitMQ
export const RABBIT_HOST = 'localhost';
export const RABBIT_PORT = 5672;
export const RABBIT_DURABLE = false;

export const RABBIT_QUEUE_APP = 'game-queue-app';
export const RABBIT_QUEUE_ORCHESTRATOR = 'game-queue-orchestrator';
export const RABBIT_QUEUE_MATCH = 'game-queue-match';

export enum MatchStatus {
  STAND_BY = 0,
  WAITING_PLAYERS = 1,
  PLAYING = 2,
  END_GAME = 3,
}
