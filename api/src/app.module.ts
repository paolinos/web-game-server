import { Module } from '@nestjs/common';

import { AuthModule } from './core/auth/auth.module';
import { GameModule } from './core/game/game.module';
import { UserModule } from './core/user/user.module';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [
    RepositoryModule,
    AuthModule,
    GameModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
