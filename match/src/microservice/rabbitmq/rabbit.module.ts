import { ClientsModule, Transport } from '@nestjs/microservices';

import { RABBIT_HOST, RABBIT_PORT } from '../../consts';

export const createRabbitOptions = (queueName:string, moduleName:string= null):any => {
    let options = { 
        transport: Transport.RMQ,
        options: {
            urls: [`amqp://${RABBIT_HOST}:${RABBIT_PORT}`],
            queue: queueName,
            queueOptions: {
                durable: false
            },
        },
    }

    if(moduleName){
        options['name'] = moduleName; 
    }

    return options;
}

export const createRabbitModule = (moduleName:string, queueName:string) => {
    return ClientsModule.register([
        createRabbitOptions(queueName, moduleName)
    ]);
}