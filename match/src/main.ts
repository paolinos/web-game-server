import { NestFactory } from '@nestjs/core';

import { RABBIT_QUEUE_MATCH } from './consts';
import { createRabbitOptions } from './microservice/rabbitmq/rabbit.module';
import { AppModule } from './app.module';

const MATCH_PORT:number = 8000;
const GAME_NAME:string = "PONG";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });
	app.connectMicroservice(createRabbitOptions(RABBIT_QUEUE_MATCH));

	await app.startAllMicroservices();
	await app.listen(MATCH_PORT, () => {
		console.log(`Match running at port: ${MATCH_PORT}`)
	});
}
bootstrap();
