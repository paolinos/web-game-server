import { IdEntity } from '../domain/id.entity';

export interface RepositoryQueries<T> {
  getById(id: string): Promise<T | null>;

  save(entity: T): Promise<void>;

  removeById(id: string): Promise<boolean>;
}

export abstract class Repository<T extends IdEntity>
  implements RepositoryQueries<T>
{
  protected data: T[] = [];

  async getById(id: string): Promise<T | null> {
    return this.data.find((q) => q.id === id) || null;
  }

  abstract save(entity: T): Promise<void>;

  async removeById(id: string): Promise<boolean> {
    const index = this.data.findIndex((q) => q.id === id);
    if (index < 0) return false;

    this.data.splice(index, 1);
    return true;
  }
}
