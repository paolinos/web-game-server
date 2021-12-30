import { Match } from "../domain/match";
import { Repository } from "./repository";

export interface MatchQueries {
    
}

export class MatchRepository extends Repository<Match>{
    
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

}