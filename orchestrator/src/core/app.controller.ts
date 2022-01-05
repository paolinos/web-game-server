import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { AppService } from './app.service';
import { SEARCH_GAME_EVENT } from '../microservice/rabbitmq/events';
import { UserDto } from './user.dto';


@Controller()
export class AppController {
    
  constructor(
    private readonly appService: AppService,
  ) {}

  @EventPattern(SEARCH_GAME_EVENT)
  async playerSearchingGame(data: UserDto):Promise<void> {

    //
    await this.appService.addUser(data);


    console.info("appService.gameInit");
  }
}
