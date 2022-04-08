import { Module } from '@nestjs/common';
import { RepositoryModule } from '../../repositories/repository.module';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
	imports : [
		RepositoryModule
	  ],
	controllers: [MatchController],
	providers: [MatchService],
})
export class MatchModule {}
