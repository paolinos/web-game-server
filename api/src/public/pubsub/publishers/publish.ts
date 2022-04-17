import { RABBIT_QUEUE_APP, TOPIC_APP_SEARCH } from '../../../consts';
import { RabbitMq } from '../rabbitmq';

export interface SearchGameMessage {
    id: string,
    email: string;
}

/**
 * Publish Search Game message
 * @param {SearchGameMessage} payload Message to send 
 */
export const publishSearchGame = async (payload:SearchGameMessage) => {
    const [conn, channel] = await RabbitMq.getConnAndChannel();

    await channel.assertQueue(RABBIT_QUEUE_APP, {durable: true});

    // NOTE: add topic to each message
    const message = {
        topic: TOPIC_APP_SEARCH,
        id: payload.id,
        email: payload.email
    };
    await channel.sendToQueue(RABBIT_QUEUE_APP, Buffer.from(JSON.stringify(message)));

    await RabbitMq.close(conn, channel);
}