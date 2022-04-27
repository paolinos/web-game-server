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

export abstract class RabbitConn {
    private _connection:Connection|null = null;

    private readonly _host:string;
    private readonly _port:number; 

    constructor(host:string, port:number){
        this._host = host;
        this._port = port;
    }

    async getConn():Promise<Connection>{
        if(!this._connection){
            this._connection = await connect(`amqp://${this._host}:${this._port}`, "heartbeat=60");
        }
        return this._connection;
    }

    async getChannel():Promise<Channel>{
        const conn = await this.getConn();
        return conn.createChannel();
    }

    async closeChannel(channel:Channel):Promise<void>{
        await channel.close();
    }
    async closeConn(channel:Channel|null):Promise<void>{
        if(channel){
            this.closeChannel(channel);
        }
        await this._connection?.close();
    }

}