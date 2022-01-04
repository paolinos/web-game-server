import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RepositoryModule } from '../../repositories/repository.module';

@Module({
	imports: [RepositoryModule],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
