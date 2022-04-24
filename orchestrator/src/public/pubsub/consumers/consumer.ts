import { Channel, Connection } from 'amqplib';
import {
  RABBIT_DURABLE,
  RABBIT_HOST,
  RABBIT_PORT,
  RABBIT_QUEUE_APP,
  RABBIT_QUEUE_MATCH,
  RABBIT_QUEUE_ORCHESTRATOR,
} from '../../../consts';
import { RabbitMessage, RabbitMq } from '../rabbitmq';


interface BaseConsumer {
  subscribeTo(name: string, func: Function): void;

  unsubscribeTo(name: string): void;

  consumeFromQueue<T>(delegate: SubscriberDelegate<T>):Promise<void>;

  consumeFromTopic(topic:string):Promise<void>;
}



interface SubscriberDelegate<T> {
  (message: T): void;
}

abstract class Consumer implements BaseConsumer {
  protected readonly _listeners: { [name: string]: Function } = {};
  private readonly _queue: string;
  
  // @ts-ignore
  protected conn: Connection; 
  // @ts-ignore
  protected channel: Channel;

  constructor(queue: string) {
    this._queue = queue;
  }
  

  subscribeTo<T>(name: string, delegate: SubscriberDelegate<T>) {
    this._listeners[name] = delegate;
  }

  unsubscribeTo(name: string) {
    delete this._listeners[name];
  }
  private async init(){
    if(!this.conn || !this.channel){
      [this.conn, this.channel] = await RabbitMq.getConnAndChannel(
        RABBIT_HOST,
        RABBIT_PORT,
      );
    }
  }

  async consumeFromQueue<T>(delegate: SubscriberDelegate<T>): Promise<void> {
    await this.init();

    await this.channel.assertQueue(this._queue, { durable: RABBIT_DURABLE });
    await this.channel.consume(this._queue, (msg:any) => {
      try {
        if(!msg) return this.channel.ack(msg);

        const message = JSON.parse(msg.content.toString()) as T;
        delegate(message);

        this.channel.ack(msg);

      } catch (error) {
        console.error('Error consumeFromQueue:',this._queue,'with msg:',msg.content.toString());
      }
    });
  }

  private async onMessage(msg:any){
    
    try {
      if(!msg) return this.channel.ack(msg);
      
      const messageStr = msg.content.toString();
      const message = JSON.parse(messageStr) as RabbitMessage;

      const delegate = this._listeners[message.topic];
      if (delegate) {
        delegate(message);
      }

      this.channel.ack(msg); 
    } catch (error) {
      console.error('Error trying to listen :',this._queue,'with msg:',msg.content.toString());
    }
  }



  async consumeFromTopic(topic:string){
    await this.init();
    
    await this.channel.assertExchange(topic, 'topic', {durable: RABBIT_DURABLE});
    const result = await this.channel.assertQueue('', {exclusive: true});
    
    // TODO: not sure..
    const pattern:string = 'data';

    await this.channel.bindQueue(result.queue, topic, pattern);
    await this.channel.consume(result.queue, this.onMessage.bind(this));
  }
}

export class AppConsumer extends Consumer {
  constructor() {
    super(RABBIT_QUEUE_APP);
  }
}

export class OrchestratorConsumer extends Consumer {
  constructor() {
    super(RABBIT_QUEUE_ORCHESTRATOR);
  }
}

export class MatchConsumer extends Consumer {
  constructor() {
    super(RABBIT_QUEUE_MATCH);
  }
}