import { User } from "../domain/user";
import { Repository } from "./repository";

export interface UserQueries {

    add(user:User):Promise<void>;

    removeById(id:string):Promise<boolean>;

}

export class UserRepository extends Repository<User> implements UserQueries{
    
    async add(user: User): Promise<void> {
        this.data.push(user);
    }

    async removeById(id: string): Promise<boolean> {
        
        const index = this.data.findIndex(q => q.id === id);
        if(index < 0) return false;

        this.data.splice(index, 1);
        return true;
    }
    
    async save(entity: User): Promise<void> {
        // TODO: ?
    }
}