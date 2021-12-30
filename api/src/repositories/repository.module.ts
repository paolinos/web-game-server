import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { MatchRepository } from './match.repository';

@Module({
    imports: [],
    controllers: [],
    providers: [
        UserRepository,
        MatchRepository
    ],
    exports:[
        UserRepository,
        MatchRepository
    ]
})
export class RepositoryModule {}
