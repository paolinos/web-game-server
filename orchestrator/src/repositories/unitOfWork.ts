import { UserQueries, UserRepository } from './user.repository';
import { MatchQueries, MatchRepository } from './match.repository';
import {
  GameServerQueries,
  GameServerRepository,
} from './game-server.repository';

class ContextUnitOfWork {
  private static _userRepository: UserQueries;

  get UserRepository(): UserQueries {
    if (!ContextUnitOfWork._userRepository) {
      ContextUnitOfWork._userRepository = new UserRepository();
    }
    return ContextUnitOfWork._userRepository;
  }

  private static _matchRepository: MatchQueries;

  get MatchRepository(): MatchQueries {
    if (!ContextUnitOfWork._matchRepository) {
      ContextUnitOfWork._matchRepository = new MatchRepository();
    }
    return ContextUnitOfWork._matchRepository;
  }

  private static _gameServerRepository: GameServerQueries;

  get GameServerRepository(): GameServerQueries {
    if (!ContextUnitOfWork._gameServerRepository) {
      ContextUnitOfWork._gameServerRepository = new GameServerRepository();
    }
    return ContextUnitOfWork._gameServerRepository;
  }
}

export default new ContextUnitOfWork();
