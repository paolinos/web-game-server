import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { RABBIT_QUEUE_APP } from './consts';
import { createRabbitOptions } from './microservice/rabbitmq/rabbit.module';
import { AppModule } from './core/app.module';



async function bootstrap() {

  //--------------------------------------------------------
	//	"Microservices"

  //  RabbitMQ Consumer - RABBIT_QUEUE_APP queue
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    createRabbitOptions(RABBIT_QUEUE_APP)
  );

  await app.listen();
}
bootstrap();
