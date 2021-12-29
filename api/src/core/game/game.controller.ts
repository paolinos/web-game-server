import { BadRequestException, Controller, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GameService } from './game.service';

@ApiTags('Game')
@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@ApiBearerAuth()
	@HttpCode(HttpStatus.ACCEPTED)
	@Put()
	async searchGame(): Promise<void> {

		const result = await this.gameService.searchGame("jwt.email");

		if(!result){
			throw new BadRequestException();
		}

	}
}
