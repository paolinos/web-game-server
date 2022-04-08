import { Module } from '@nestjs/common';
import { MatchRepository } from './match.repository';

@Module({
    imports: [],
    controllers: [],
    providers: [
        MatchRepository
    ],
    exports:[
        MatchRepository
    ]
})
export class RepositoryModule {}
