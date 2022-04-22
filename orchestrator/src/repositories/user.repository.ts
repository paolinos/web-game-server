import { User } from "../domain/user";
import { Repository, RepositoryQueries } from "./repository";

export interface UserQueries extends RepositoryQueries<User> {

    add(user:User):Promise<void>;

    getUsersAvailable():Promise<User[]>;
}

export class UserRepository extends Repository<User> implements UserQueries{

    async add(user: User): Promise<void> {
        this.data.push(user);
    }

    async getUsersAvailable(): Promise<User[]> {
        return this.data.filter(q => q.isAvailable);
    }
    
    async save(entity: User): Promise<void> {
        // TODO: ?
    }
}