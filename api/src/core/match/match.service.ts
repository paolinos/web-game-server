import { Inject, Injectable } from '@nestjs/common';

import { MatchRepository } from '../../repositories/match.repository';
import { Match, MatchStatus } from '../../domain/match';
import { UserInformation } from '../../domain/user';

@Injectable()
export class MatchService {

    constructor(
		private readonly matchRepository:MatchRepository
	){}

    async matchCreated(matchId:string, users:UserInformation[]):Promise<void>{
        
        const match = new Match();
        match.id = matchId;
        match.users = users;
        match.status = MatchStatus.STAND_BY;
        
        this.matchRepository.save(match);
    }

    async matchBegun(matchId:string):Promise<void>{
        this.matchRepository.updateMatchStatus(matchId, MatchStatus.PLAYING);
    }

    async matchEnd(matchId:string, users:UserInformation[]){
        this.matchRepository.updateMatchStatus(matchId, MatchStatus.END_GAME);

        // TODO: save user points userRepository
    }
}
