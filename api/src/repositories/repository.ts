import { IdEntity } from "../domain/id.entity";

export abstract class Repository<T extends IdEntity>{

    protected data:T[] = [];
    
    async getById(id:string):Promise<T|null> {
        return this.data.find(q => q.id === id) || null;
    }

    abstract save(entity:T):Promise<void>;
}