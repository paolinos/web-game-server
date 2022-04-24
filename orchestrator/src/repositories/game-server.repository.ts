import { GameServer, GameServerStatus } from '../domain/game-server';
import { Repository, RepositoryQueries } from './repository';

export interface GameServerQueries extends RepositoryQueries<GameServer> {
  getAllByStatus(gameServerStatus: GameServerStatus): Promise<GameServer[]>;

  add(gameServer: GameServer): Promise<void>;
}

export class GameServerRepository
  extends Repository<GameServer>
  implements GameServerQueries
{
  async getAllByStatus(
    gameServerStatus: GameServerStatus,
  ): Promise<GameServer[]> {
    return this.data.filter((q) => q.status === gameServerStatus);
  }

  async add(gameServer: GameServer): Promise<void> {
    this.data.push(gameServer);
  }

  /**
   * Save does nothing with static.
   */
  async save(entity: GameServer): Promise<void> {
    // TODO: ?
  }
}
