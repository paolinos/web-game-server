import { Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';

@Injectable()
export class AppService {

  async addUser(user:UserDto):Promise<void>{

    // TODO:
    //  Add user to Queue
    
  }

  async checkMatch(){

    // TODO:

  }

}
