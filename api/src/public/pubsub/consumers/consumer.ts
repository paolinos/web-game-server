import { EventEmitter } from 'stream';
import { RABBIT_QUEUE_MATCH, TOPIC_MATCH_INIT } from '../../../consts';
import {RabbitMessage, RabbitMq} from '../rabbitmq';

export class MatchConsumer extends EventEmitter{

    constructor(){
        super();

        this.listen();
    }

    private listen(){
        setTimeout(async() => {
            await this.startListening.bind(this);
        }, 10);
    }

    private async startListening(){
        const [conn, channel] = await RabbitMq.getConnAndChannel();

        await channel.assertQueue(RABBIT_QUEUE_MATCH, {durable: true});
        await channel.consume(RABBIT_QUEUE_MATCH, async (msg) => {
            if(msg){
                try {
                    const messageStr = msg.content.toString();
                    const message = JSON.parse(messageStr) as RabbitMessage;
                    if(message.topic === TOPIC_MATCH_INIT){
                        this.emit(message.topic, message)
                    }
                    channel.ack(msg);
                }
                catch(err){
                    console.error("Error trying to listen :", RABBIT_QUEUE_MATCH, "with msg:", msg.content.toString());
                }
            }

            RabbitMq.close(conn, channel);

            this.listen();
        });
    }


}