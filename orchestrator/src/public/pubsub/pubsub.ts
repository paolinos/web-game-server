/**
 * TODO: Reference. not implemeted yet 
 */


export interface Message {
    at:Date;
}
/*
export interface Delegate<T> {
    (message: T): void;
}*/

export interface QueuePublisher {
    sendToQueue<T extends Message>(data:T):Promise<void>;
}

export interface QueueConsumer {
    consumeFromQueue(delegate: (data:Buffer) => void):Promise<void>;
}

export interface TopicPublisher{
    publishTopic<T extends Message>(topic:string, message:T):Promise<void>;
}

export interface TopicConsumer {
    consumeFromTopic(topic:string, delegate: (data:Buffer) => void):Promise<void>;
}