import { connect, Connection, Channel } from 'amqplib';
import { RABBIT_HOST, RABBIT_PORT } from '../../consts';

export class RabbitMq {

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

/**
 * RabbitMessageBroker
 * Base class to have the RabbitMessage
 */
export abstract class RabbitMessageBroker {
    // @ts-ignore
    private _conn:Connection;
    // @ts-ignore
    private _channel:Channel;

    constructor(){ }

    protected async connect(){
        if(!RABBIT_HOST || !RABBIT_PORT){
            throw new Error("Please review 'RABBIT_HOST,RABBIT_PORT' settings");
        }

        if(this._conn && this._channel){
            return;
        }

        this._conn = await connect(`amqp://${RABBIT_HOST}:${RABBIT_PORT}`, "heartbeat=60");
        this._channel = await this._conn.createChannel();
    }

    protected get conn():Connection{
        return this._conn;
    }

    protected get channel():Channel{
        return this._channel;
    }

    protected async closeChannel(){
        await this._channel.close();
    }

    protected async closeConnection(){
        await this._conn.close();
    }

    protected async closeAll(){
        await this.closeChannel();
        await this.closeConnection();
    }
}