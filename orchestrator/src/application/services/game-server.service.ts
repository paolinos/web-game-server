import {
  createErrorEmptyResult,
  createSuccessEmptyResult,
  EmptyObjectResult,
} from '../objectResult';
import { GameServerService } from '../interfaces/game-server.service.interface';
import { GameServerQueries } from '../../repositories/game-server.repository';
import {
  GameServer,
  GameServerStatus,
  GameType,
} from '../../domain/game-server';

export class GameServerBusinessLogic implements GameServerService {
  constructor(private readonly gameServerRepository: GameServerQueries) {}

  async ready(
    id: string,
    name: string,
    host: string,
    type: GameType,
    totalPlayers: number,
  ): Promise<EmptyObjectResult> {
    try {
      let gameServer = await this.gameServerRepository.getById(id);
      if (!gameServer) {
        gameServer = new GameServer();
        gameServer.host = host;
        gameServer.name = name;
        gameServer.type = type;
        gameServer.totalPlayers = totalPlayers;

        await this.gameServerRepository.add(gameServer);
      } else {
        gameServer.host = host;
        gameServer.name = name;
        gameServer.type = type;
        gameServer.updatedAt = new Date();

        await this.gameServerRepository.save(gameServer);
      }

      return createSuccessEmptyResult();
    } catch (error) {
      let errorMsg = error;
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      return createErrorEmptyResult(`Error: ${errorMsg}`);
    }
  }

  async update(id: string, status: string): Promise<EmptyObjectResult> {
    try {
      const gameServer = await this.gameServerRepository.getById(id);
      if (!gameServer) {
        return createErrorEmptyResult(
          `Error GameServer with id:${id} not exist`,
        );
      }

      gameServer.status =
        (status as GameServerStatus) || GameServerStatus.DEFAULT;
      this.gameServerRepository.save(gameServer);

      return createSuccessEmptyResult();
    } catch (error) {
      let errorMsg = error;
      if (error instanceof Error) {
        errorMsg = error.message;
      }

      return createErrorEmptyResult(`Error: ${errorMsg}`);
    }
  }
}
