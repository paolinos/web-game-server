import { Delegate, Message, QueueConsumer, TopicConsumer } from '../pubsub';
import { RABBIT_DURABLE, RABBIT_QUEUE_MATCH } from '../../../consts';
import { RabbitMessageBroker } from '../rabbitmq';


export class MatchConsumer extends RabbitMessageBroker implements QueueConsumer, TopicConsumer{
    
    constructor(){
        super();

    }
    
    async consumeFromQueue<T extends Message>(delegate: Delegate<T>): Promise<void> {
        await this.connect();

        await this.channel.assertQueue(RABBIT_QUEUE_MATCH, { durable: RABBIT_DURABLE });
        
        await this.channel.consume(RABBIT_QUEUE_MATCH, (msg) => {
            const value = this.onMessage(msg);
            if(!value){
                delegate(value as unknown as T);
            }
        });
    }

    async consumeFromTopic<T extends Message>(topic: string, delegate: Delegate<T>): Promise<void> {
        await this.connect();

        await this.channel.assertExchange(topic, 'topic', {durable: RABBIT_DURABLE});
        const result = await this.channel.assertQueue('', {exclusive: false});
        
        // TODO: not sure..
        const pattern:string = 'data';
    
        await this.channel.bindQueue(result.queue, topic, pattern);
        await this.channel.consume(result.queue, (msg) => {
            const value = this.onMessage(msg);
            if(!value){
                delegate(value as unknown as T);
            }
        });
    }

    private onMessage<T extends Message>(msg:any):T|null{
        try {
            if(msg) {
                const messageStr = msg.content.toString();
                const message = JSON.parse(messageStr);           
                this.channel.ack(msg);
                return message;
            }
    
        } catch (error) {
          console.error('Error onMessage: with msg:',msg.content.toString(), error);
        }

        this.channel.ack(msg);
        return null;
    }
}