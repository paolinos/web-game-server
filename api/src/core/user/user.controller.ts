import { BadRequestException, Controller, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto } from './user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiBearerAuth()
	@Get()
	async getUser(): Promise<UserDto> {

		const result = await this.userService.getUserByEmail("jwt.email");
        if(!result){
            throw new BadRequestException();
        }
        
        return new UserDto(result.email, result.points);
	}
}
