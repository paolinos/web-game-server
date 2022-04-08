import { Module } from '@nestjs/common';
import { RepositoryModule } from '../../repositories/repository.module';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';

@Module({
  imports : [
    RepositoryModule
  ],
  controllers: [GameController],
  providers: [GameGateway]
})
export class GameModule {}