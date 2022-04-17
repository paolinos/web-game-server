export interface MessageBrokerService{
    
    publish(queueName:string, payload:any):Promise<void>;

}