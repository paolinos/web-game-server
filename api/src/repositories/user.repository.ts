import { User } from "../domain/user";
import { Repository } from "./repository";

export interface UserQueries {
    getByEmail(email:string):Promise<User>;
}

export class UserRepository extends Repository<User> implements UserQueries{
    
    async getByEmail(email: string): Promise<User> {
        return await this.data.find(q => q.email === email);
    }

    /**
     * Add or Update
     * @param entity 
     */
    async save(entity: User): Promise<void> {
        // NOTE: for this example we're using only one logic to add or update
        const current = await this.getById(entity.id);
        if(!current){
            this.data.push(entity);
        }else{
            current.lastSigin = new Date();
            current.status = entity.status;
        }
    }

}