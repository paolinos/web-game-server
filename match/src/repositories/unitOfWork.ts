//import { UserRepository } from "./user.repository";
import { MatchRepository } from "./match.repository";

class ContextUnitOfWork {

    //private static _userRepository:UserRepository;
    private static _matchRepository:MatchRepository;

    /*
    get UserRepository():UserRepository {
        if(!ContextUnitOfWork._userRepository){
            ContextUnitOfWork._userRepository = new UserRepository();
        }
        return ContextUnitOfWork._userRepository;
    }
    */

    get MatchRepository():MatchRepository {
        if(!ContextUnitOfWork._matchRepository){
            ContextUnitOfWork._matchRepository = new MatchRepository();
        }
        return ContextUnitOfWork._matchRepository;
    }
}

export default new ContextUnitOfWork();