import {
  RABBIT_DURABLE,
  RABBIT_HOST,
  RABBIT_PORT,
  RABBIT_QUEUE_APP,
  RABBIT_QUEUE_MATCH,
  RABBIT_QUEUE_ORCHESTRATOR,
} from '../../../consts';
import { RabbitMq } from '../rabbitmq';
import { TOPIC } from '../topics';

const sendToQueue = async (queue: string, message: any): Promise<void> => {
  const [conn, channel] = await RabbitMq.getConnAndChannel(
    RABBIT_HOST,
    RABBIT_PORT,
  );

  await channel.assertQueue(queue, { durable: RABBIT_DURABLE });
  await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

  await RabbitMq.close(conn, channel);
};

const publishTopic = async (topic:string, message:any): Promise<void> => {
  const [conn, channel] = await RabbitMq.getConnAndChannel(
    RABBIT_HOST,
    RABBIT_PORT,
  );

  const routingKey:string = 'data';

  await channel.assertExchange(topic, 'topic', { durable: RABBIT_DURABLE });
  await channel.publish(topic, routingKey, Buffer.from(JSON.stringify(message)));
  
  await RabbitMq.close(conn, channel);
}

export const addQueueToSearchUsersToMatch = async (): Promise<void> => {
  const message = {
    topic: TOPIC.SEARCH_USERS_TO_MATCH,
  };
  sendToQueue(RABBIT_QUEUE_ORCHESTRATOR, message);
};

export interface GameServerAssignedMatchMessage {
  matchId: string;
  gameServerId: string;
  users: { id: string; email: string }[];
}

export const publishGameServerAssingedMatch = async (
  payload: GameServerAssignedMatchMessage,
): Promise<void> => {
  const message = {
    topic: TOPIC.GAME_SERVER_ASSIGNED_TO_MATCH,
    ...payload,
  };

  publishTopic(TOPIC.GAME_SERVER_ASSIGNED_TO_MATCH, message);
};

export interface UsersAssignedMatchMessage {
  matchId: string;
  gameServerHost: string;
  users: { id: string; email: string }[];
}
export const publishUsersAssingedMatch = async (
  payload: UsersAssignedMatchMessage,
): Promise<void> => {
  const message = {
    topic: TOPIC.USER_ASSIGNED_TO_MATCH,
    ...payload,
  };

  publishTopic(TOPIC.USER_ASSIGNED_TO_MATCH, message);
};
