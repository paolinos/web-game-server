import {
    RABBIT_DURABLE,
    RABBIT_HOST,
    RABBIT_PORT,
  } from '../../../consts';
  import { RabbitMq } from '../rabbitmq';
  
export const sendToQueue = async (queue: string, message: any): Promise<void> => {
  const [conn, channel] = await RabbitMq.getConnAndChannel(
    RABBIT_HOST,
    RABBIT_PORT,
  );

  await channel.assertQueue(queue, { durable: RABBIT_DURABLE });
  await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

  await RabbitMq.close(conn, channel);
};
  
export const publishTopic = async (topic:string, message:any): Promise<void> => {
  const [conn, channel] = await RabbitMq.getConnAndChannel(
    RABBIT_HOST,
    RABBIT_PORT,
  );

  const routingKey:string = 'data';

  await channel.assertExchange(topic, 'topic', { durable: RABBIT_DURABLE });
  await channel.publish(topic, routingKey, Buffer.from(JSON.stringify(message)));
  
  await RabbitMq.close(conn, channel);
};