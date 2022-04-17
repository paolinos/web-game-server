import { RABBIT_QUEUE_APP, TOPIC_APP_SEARCH, TOPIC_APP_STOP_SEARCHING_GAME } from '../../../consts';
import { RabbitMq } from '../rabbitmq';

export interface SearchGameMessage {
    id: string,
    email: string;
}


const publish = async (message:any):Promise<void> => {
    const [conn, channel] = await RabbitMq.getConnAndChannel();

    await channel.assertQueue(RABBIT_QUEUE_APP, {durable: true});

    await channel.sendToQueue(RABBIT_QUEUE_APP, Buffer.from(JSON.stringify(message)));

    await RabbitMq.close(conn, channel);
}

/**
 * Publish Search Game message
 * @param {SearchGameMessage} payload data to send 
 */
export const publishSearchGame = async (payload:SearchGameMessage):Promise<void> => {
    // NOTE: add topic to each message
    const message = {
        topic: TOPIC_APP_SEARCH,
        id: payload.id,
        email: payload.email
    };
    publish(message);
}

/**
 * User stop searching game
 * @param {SearchGameMessage} payload data to send
 */
export const publishStopSearchingGame = async (payload:SearchGameMessage):Promise<void> => {
    // NOTE: add topic to each message
    const message = {
        topic: TOPIC_APP_STOP_SEARCHING_GAME,
        id: payload.id,
        email: payload.email
    };
    publish(message);
}