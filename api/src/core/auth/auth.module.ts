import { Module } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
})
export class AuthModule {}
