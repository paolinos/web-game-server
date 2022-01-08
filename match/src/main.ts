import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { RABBIT_QUEUE_MATCH } from './consts';
import { createRabbitOptions } from './microservice/rabbitmq/rabbit.module';
import { MatchModule } from './core/match/match.module';

async function bootstrap() {
  //--------------------------------------------------------
	//	"Microservices"

  //  RabbitMQ Consumer - RABBIT_QUEUE_MATCH queue
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MatchModule,
    createRabbitOptions(RABBIT_QUEUE_MATCH)
  );

  await app.listen();
}
bootstrap();
