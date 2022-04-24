import { Match } from '../../domain/match';
import { User, UserStatus } from '../../domain/user';
import { GameServer, GameServerStatus } from '../../domain/game-server';
import { UserQueries } from '../../repositories/user.repository';
import {
  createErrorResult,
  createSuccessResult,
  ObjectResult,
} from '../objectResult';
import { MatchService } from '../interfaces/match.service.interface';
import { GameServerQueries } from '../../repositories/game-server.repository';
import { MatchQueries } from '../../repositories/match.repository';

export class MatchBusinessLogic implements MatchService {
  constructor(
    private readonly userRepository: UserQueries,
    private readonly gameServerRepository: GameServerQueries,
    private readonly matchRepository: MatchQueries,
  ) {}

  async createMatchIfPlayersAreReady(): Promise<ObjectResult<Match | null>> {
    try {
      const [users, gameServers] = await Promise.all([
        this.userRepository.getUsersAvailable(),
        this.gameServerRepository.getAllByStatus(GameServerStatus.READY),
      ]);

      if (gameServers.length === 0)
        return createErrorResult<Match>('No match free');
      const gameServer = gameServers[0];
      if (users.length < gameServer.totalPlayers)
        return createSuccessResult<null>(null);

      const match = await this.createMatch(gameServer, [users[0], users[1]]);

      return createSuccessResult<Match>(match);
    } catch (error) {
      let errorMsg = error;
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      return createErrorResult<Match>(`Error: ${errorMsg}`);
    }
  }

  private async createMatch(
    gameServer: GameServer,
    users: User[],
  ): Promise<Match> {
    const playerOne = users[0];
    const playerTwo = users[1];

    playerOne.status = UserStatus.ASSIGNED_TO_MATCH;
    playerTwo.status = UserStatus.ASSIGNED_TO_MATCH;
    gameServer.status = GameServerStatus.WAITING_PLAYERS;

    const match = Match.newMatch(gameServer.id, gameServer.host, [
      { id: playerOne.id, email: playerOne.email },
      { id: playerTwo.id, email: playerTwo.email },
    ]);

    // db transaction :P
    await Promise.all([
      this.gameServerRepository.save(gameServer),
      this.userRepository.save(playerOne),
      this.userRepository.save(playerTwo),
      this.matchRepository.add(match),
    ]);

    return match;
  }
}
