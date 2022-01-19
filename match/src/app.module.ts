import { Module } from '@nestjs/common';
import { GameModule } from './core/game/game.module';
import { MatchModule } from './core/match/match.module';
import { MainController } from './core/main.controller';


@Module({
    imports: [
        MatchModule,
        GameModule
    ],
    controllers: [
        MainController
    ]
})
export class AppModule {}