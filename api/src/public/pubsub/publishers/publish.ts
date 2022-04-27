import { RABBIT_DURABLE, RABBIT_QUEUE_APP } from '../../../consts';
import { Message, TopicPublisher } from '../pubsub';
import { RabbitMq } from '../rabbitmq';
import { TOPIC } from '../topics';

const sendToQueue = async (queue: string, message: any): Promise<void> => {
    const [conn, channel] = await RabbitMq.getConnAndChannel();
  
    await channel.assertQueue(queue, { durable: RABBIT_DURABLE });
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  
    await RabbitMq.close(conn, channel);
  };
  
const publishTopic = async (topic:string, message:any): Promise<void> => {
    const [conn, channel] = await RabbitMq.getConnAndChannel();
  
    const routingKey:string = 'data';
  
    await channel.assertExchange(topic, 'topic', { durable: RABBIT_DURABLE });
    await channel.publish(topic, routingKey, Buffer.from(JSON.stringify(message)));
    
    await RabbitMq.close(conn, channel);
}



export interface SearchGamePayload {
    id: string,
    email: string;
}

interface SearchGameMessage extends SearchGamePayload, Message {
    topic:string;
}


/**
 * Publish Search Game message
 * @param {SearchGameMessage} payload data to send 
 */
export const publishSearchGame = async (payload:SearchGamePayload):Promise<void> => {
    // TODO: delete topic property
    const message:SearchGameMessage = {
        topic: TOPIC.SEARCH_GAME,
        id: payload.id,
        email: payload.email,
        at: new Date()
    };
    publishTopic(TOPIC.SEARCH_GAME, message);
}

/**
 * User stop searching game
 * @param {SearchGameMessage} payload data to send
 */
export const publishStopSearchingGame = async (payload:SearchGamePayload):Promise<void> => {
    // TODO: delete topic property
    const message:SearchGameMessage = {
        topic: TOPIC.CANCEL_SEARCH_GAME,
        id: payload.id,
        email: payload.email,
        at: new Date()
    };
    publishTopic(TOPIC.CANCEL_SEARCH_GAME, message);
}