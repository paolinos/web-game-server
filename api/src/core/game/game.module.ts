import { Module } from '@nestjs/common';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { RepositoryModule } from '../../repositories/repository.module';
import { createRabbitModule } from '../../microservice/rabbitmq/rabbit.module';
import { RABBIT_QUEUE_APP } from '../../consts';
import { APP_RABBIT_SERVICE } from './game.const';

@Module({
	imports: [
		RepositoryModule,
		createRabbitModule(APP_RABBIT_SERVICE, RABBIT_QUEUE_APP)
	],
	controllers: [GameController],
	providers: [GameService],
})
export class GameModule {}
