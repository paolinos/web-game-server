import { Controller, Get } from '@nestjs/common';

/**
 * Empty controller. 
 */
@Controller()
export class MainController {

    @Get()
    async status():Promise<any> {
        return {
            "status": Date.now()
        }
    }
}