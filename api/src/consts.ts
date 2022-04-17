// App
export const PORT:number = 3000;

// Swagger
export const SWAGGER_TITLE:string = "Api - Game";
export const SWAGGER_DESCRIPTION:string = "Not much to say....";
export const SWAGGER_VERSION:string = "0.0.2";
export const SWAGGER_PATH:string = "swagger";
export const SWAGGER_JSON_PATH:string = "./swagger-spec.json";

// JWT
export const JWT_SECRET:string="jwt-secret";
/**
 * Expressed in minutes
 */
export const JWT_EXPIRATION:number=60;


//  RabbitMQ
export const RABBIT_HOST:string="localhost";
export const RABBIT_PORT:number=5672;

export const RABBIT_QUEUE_APP:string="game-queue-app";
export const RABBIT_QUEUE_MATCH:string="game-queue-match";

// Topics
export const TOPIC_APP_SEARCH:string = "topic-app-search";
export const TOPIC_MATCH_INIT:string = "topic-match-init";
export const TOPIC_MATCH_END:string = "topic-match-end";
export const TOPIC_MATCH_ERROR:string = "topic-match-error";