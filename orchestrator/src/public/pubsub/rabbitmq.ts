import { connect, Connection, Channel } from 'amqplib';

export class RabbitMq{

    public static async getConnAndChannel(host:string, port:number):Promise<[Connection,Channel]>{

        if(!host || !port){
            throw new Error("The properties 'host,port' are required");
        }

        const conn = await connect(`amqp://${host}:${port}`, "heartbeat=60");
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