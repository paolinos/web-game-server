import { RABBIT_HOST, RABBIT_PORT, RABBIT_QUEUE_APP, RABBIT_QUEUE_MATCH } from '../../../consts';
import {RabbitMessage, RabbitMq} from '../rabbitmq';

interface BaseConsumer {
    subscribeTo(name:string, func:Function):void;

    unsubscribeTo(name:string):void;

    startToListen():void;

    startToListenAsync():Promise<void>;
}

interface SubscriberDelegate<T> {
    (message: T): void;
}

abstract class Consumer implements BaseConsumer {
    
    protected readonly _listeners: {[name: string]: Function } = {};
    private readonly _queue:string;

    constructor(queue:string){
        this._queue = queue;
    }

    subscribeTo<T>(name: string, delegate: SubscriberDelegate<T>){
        this._listeners[name] = delegate;
    }

    unsubscribeTo(name: string){
        delete this._listeners[name];
    }

    startToListen(){
        setTimeout(async() => {
            await this.listen.bind(this);
        }, 10);
    }

    async startToListenAsync():Promise<void>{
        await this.listen();
        await this.startToListenAsync();
    }

    private async listen(){
        const [conn, channel] = await RabbitMq.getConnAndChannel(RABBIT_HOST, RABBIT_PORT);

        await channel.assertQueue(this._queue, {durable: true});
        await channel.consume(this._queue, async (msg) => {
            if(msg){
                try {
                    const messageStr = msg.content.toString();
                    const message = JSON.parse(messageStr) as RabbitMessage;
                    
                    const delegate = this._listeners[message.topic];
                    if(delegate){
                        delegate(message);
                    }

                    channel.ack(msg);
                }
                catch(err){
                    console.error("Error trying to listen :", this._queue, "with msg:", msg.content.toString());
                }
            }

            RabbitMq.close(conn, channel);
        });
    }
}

export class AppConsumer extends Consumer{
    constructor(){
        super(RABBIT_QUEUE_APP);
    }
}

export class MatchConsumer extends Consumer{
    constructor(){
        super(RABBIT_QUEUE_MATCH);
    }
}