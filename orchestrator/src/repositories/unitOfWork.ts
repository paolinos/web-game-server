import { UserRepository } from "./user.repository";

class ContextUnitOfWork {

    private static _userRepository:UserRepository;

    get UserRepository():UserRepository {
        if(!ContextUnitOfWork._userRepository){
            ContextUnitOfWork._userRepository = new UserRepository();
        }
        return ContextUnitOfWork._userRepository;
    }
}

export default new ContextUnitOfWork();