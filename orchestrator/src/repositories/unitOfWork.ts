import { UserQueries, UserRepository } from "./user.repository";
import { MatchQueries, MatchRepository } from "./match.repository";

class ContextUnitOfWork {

    private static _userRepository:UserQueries;

    get UserRepository():UserQueries {
        if(!ContextUnitOfWork._userRepository){
            ContextUnitOfWork._userRepository = new UserRepository();
        }
        return ContextUnitOfWork._userRepository;
    }

    private static _matchRepository:MatchQueries;

    get MatchRepository():MatchQueries {
        if(!ContextUnitOfWork._matchRepository){
            ContextUnitOfWork._matchRepository = new MatchRepository();
        }
        return ContextUnitOfWork._matchRepository;
    }
}

export default new ContextUnitOfWork();