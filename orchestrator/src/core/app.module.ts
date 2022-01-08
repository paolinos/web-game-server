import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createRabbitModule } from '../microservice/rabbitmq/rabbit.module';
import { APP_RABBIT_SERVICE } from './app.const';
import { RABBIT_QUEUE_MATCH } from '../consts'; 

@Module({
    imports: [
		createRabbitModule(APP_RABBIT_SERVICE, RABBIT_QUEUE_MATCH)
	],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}