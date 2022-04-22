import { Match } from '../domain/match';
import { Repository, RepositoryQueries } from './repository';

export interface MatchQueries extends RepositoryQueries<Match> {
  add(match: Match): Promise<void>;
}

export class MatchRepository extends Repository<Match> implements MatchQueries {
  async add(match: Match): Promise<void> {
    this.data.push(match);
  }

  /**
   * Save does nothing with static.
   */
  async save(entity: Match): Promise<void> {
    // TODO: ?
  }
}
