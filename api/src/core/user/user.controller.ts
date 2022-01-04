import { BadRequestException, Controller, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto } from './user.dto';
import { AuthGuard } from '../../common/auth/auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@Get()
	async getUser(@Request() res): Promise<UserDto> {

		const result = await this.userService.getUserByEmail(res.scope.user.email);
        if(!result){
            throw new BadRequestException();
        }
        
        return new UserDto(result.email, result.points);
	}
}
