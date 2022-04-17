import { connect, Connection, Channel } from 'amqplib';
import { RABBIT_HOST, RABBIT_PORT } from '../../consts';

export class RabbitMq{

    public static async getConnAndChannel():Promise<[Connection,Channel]>{

        if(!RABBIT_HOST || !RABBIT_PORT){
            throw new Error("Please review 'RABBIT_HOST,RABBIT_PORT' settings");
        }

        const conn = await connect(`amqp://${RABBIT_HOST}:${RABBIT_PORT}`, "heartbeat=60");
        const channel = await conn.createChannel();
        return [conn,channel];
    }

    public static async close(conn:Connection,channel:Channel):Promise<void>{
        await channel.close();
        await conn.close();
    }
}

/**
 * NOTE: we'll use Rabbit as simple Queue, so we'll send the topic as part of the message. Every message should have the topic
 */
export interface RabbitMessage {
    topic:string,
}