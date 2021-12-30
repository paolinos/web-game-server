import { IdEntity } from "../domain/id.entity";

export abstract class Repository<T extends IdEntity>{

    protected data:T[] = [];
    
    async getById(id:string):Promise<T> {
        return this.data.find(q => q.id === id);
    }

    abstract save(entity:T):Promise<void>;
}