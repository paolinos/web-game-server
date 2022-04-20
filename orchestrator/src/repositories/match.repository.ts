import { Match } from "../domain/match";
import { Repository, RepositoryQueries } from "./repository";

export interface MatchQueries extends RepositoryQueries<Match> {

    /**
     * 
     * @param all 
     */
    getAll(all:boolean):Promise<Match[]>;

    add(match:Match):Promise<void>;
}

export class MatchRepository extends Repository<Match> implements MatchQueries{
    
    async getAll(all:boolean=false):Promise<Match[]>{
        return this.data.filter(q => q.isFree);
    }

    async add(match: Match): Promise<void> {
        this.data.push(match);
    }
    
    async save(entity: Match): Promise<void> {
        // TODO: ?
    }
}