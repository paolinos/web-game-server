import { Module } from '@nestjs/common';

import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { RepositoryModule } from '../../repositories/repository.module';

@Module({
	imports: [
		RepositoryModule,
	],
	controllers: [MatchController],
	providers: [MatchService],
})
export class MatchModule {}