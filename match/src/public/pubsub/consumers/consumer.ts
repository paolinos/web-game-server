import { Channel, Connection } from 'amqplib';
import {
  RABBIT_DURABLE,
  RABBIT_HOST,
  RABBIT_PORT
} from '../../../consts';
import { QueueConsumer, TopicConsumer } from '../pubsub';
import { RabbitConn } from '../rabbitmq';


export class BaseQueueConsumer extends RabbitConn implements QueueConsumer{

  private readonly _queue:string;
  constructor(queue:string){
    super(RABBIT_HOST, RABBIT_PORT);
    this._queue = queue;
  }

  async consumeFromQueue<T>(delegate: (data:Buffer) => void): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertQueue(this._queue, { durable: RABBIT_DURABLE });
    await channel.consume(this._queue, (msg) => {
      try {
        if(msg){
          delegate(msg.content);

          channel.ack(msg);
        }
      } catch (error) {
        console.error('Error trying to listen :',this._queue,'with msg:',msg?.content?.toString());
      }
    });
  }
}

export class TopicConsumerManager extends RabbitConn implements TopicConsumer{

  constructor(){
    super(RABBIT_HOST, RABBIT_PORT);
  }

  async consumeFromTopic(topic: string, delegate: (data:Buffer) => void): Promise<void> {
    const channel = await this.getChannel();

    await channel.assertExchange(topic, 'topic', {durable: RABBIT_DURABLE});
    const result = await channel.assertQueue('', {exclusive: true});

    // TODO: not sure..
    const pattern:string = 'data';

    await channel.bindQueue(result.queue, topic, pattern);
    await channel.consume(result.queue, (msg) => {
      try {
        if(msg){
          delegate(msg.content);
          
          channel.ack(msg);
        }
      } catch (error) {
        console.error(`Error trying to consume topic:${topic}with msg:`,msg?.content?.toString());
      }
    });
  }
}