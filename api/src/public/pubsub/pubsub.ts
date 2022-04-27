export interface Message {
    at:Date;
}

export interface Delegate<T> {
    (message: T): void;
}

export interface QueuePublisher {
    sendToQueue<T extends Message>(data:T):Promise<void>;
}

export interface QueueConsumer {
    consumeFromQueue<T extends Message>(delegate: Delegate<T>):Promise<void>;
}

export interface TopicPublisher{
    publishTopic<T extends Message>(topic:string, message:T):Promise<void>;
}

export interface TopicConsumer {
    consumeFromTopic<T extends Message>(topic:string, delegate: Delegate<T>):Promise<void>;
}