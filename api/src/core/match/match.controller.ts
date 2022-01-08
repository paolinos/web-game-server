import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { MatchService } from './match.service';
import { BEGUN_MATCH_EVENT, CREATED_MATCH_EVENT, END_MATCH_EVENT } from '../../microservice/rabbitmq/events';
import { MatchDto } from './match.dto';

@Controller()
export class MatchController {
	
    constructor(
        private readonly matchService: MatchService
    ) {}

    @EventPattern(CREATED_MATCH_EVENT)
	async matchCreated(match:MatchDto): Promise<void> {
        console.log("CREATED_MATCH_EVENT:", match);
        
        this.matchService.matchCreated(match.id, match.users);
	}

    @EventPattern(BEGUN_MATCH_EVENT)
	async matchBegun(match:MatchDto): Promise<void> {
        console.log("BEGUN_MATCH_EVENT:", match);

        this.matchService.matchBegun(match.id);
	}

    @EventPattern(END_MATCH_EVENT)
	async matchEnd(match:MatchDto): Promise<void> {
        console.log("END_MATCH_EVENT:", match);

        this.matchService.matchEnd(match.id, match.users);
	}

    // TODO: Error event? what happened when some user disconnect?
    //  What are the minimun players to play? maybe in next version :D
}
