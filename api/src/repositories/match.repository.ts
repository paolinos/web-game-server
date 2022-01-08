import { Match, MatchStatus } from "../domain/match";
import { Repository } from "./repository";

export interface MatchQueries {
    updateMatchStatus(matchId:string, status:MatchStatus):Promise<void>;
}

export class MatchRepository extends Repository<Match> implements MatchQueries{
    
    /**
     * Add or Update
     * @param entity 
     */
    async save(entity: Match): Promise<void> {
        // NOTE: for this example we're using only one logic to add or update
        const current = await this.getById(entity.id);
        if(!current){
            this.data.push(entity);
        }else{
            current.status = entity.status;
        }
    }

    async updateMatchStatus(matchId: string, status: MatchStatus):Promise<void> {
        const current = await this.getById(matchId);
        if(current){
            current.status = status;
        }
    }

}