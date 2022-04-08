import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { CREATED_MATCH_SERVER_EVENT } from '../../microservice/rabbitmq/events';
import { MatchService } from './match.service';

@Controller()
export class MatchController {
    constructor(private readonly matchService: MatchService) {}

    @EventPattern(CREATED_MATCH_SERVER_EVENT)
    async created_match(data: any):Promise<void> {
        // TODO:

        console.log("Create Match");
    }
}
