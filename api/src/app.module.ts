import { Module } from '@nestjs/common';

import { AuthModule } from './core/auth/auth.module';
import { GameModule } from './core/game/game.module';
import { UserModule } from './core/user/user.module';
import { MatchModule } from './core/match/match.module';

@Module({
  imports: [
    AuthModule,
    GameModule,
    UserModule,
    MatchModule
  ],
})
export class AppModule {}
