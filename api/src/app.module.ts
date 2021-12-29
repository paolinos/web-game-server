import { Module } from '@nestjs/common';

import { AuthModule } from './core/auth/auth.module';
import { GameModule } from './core/game/game.module';


@Module({
  imports: [
    AuthModule,
    GameModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
