import { BadRequestException, Controller, HttpCode, HttpStatus, Put, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GameService } from './game.service';
import { AuthGuard } from '../../common/auth/auth.guard';

@ApiTags('Game')
@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@ApiBearerAuth()
	@UseGuards(AuthGuard)
	@HttpCode(HttpStatus.ACCEPTED)
	@Put()
	async searchGame(@Request() res): Promise<void> {
		if(!res.scope){
			throw new UnauthorizedException();
		}

		const result = await this.gameService.searchGame(res.scope.user.email);

		if(!result){
			throw new BadRequestException();
		}

	}
}
