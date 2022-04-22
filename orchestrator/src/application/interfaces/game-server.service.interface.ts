import { GameType } from '../../domain/game-server';
import { EmptyObjectResult, ObjectResult } from '../objectResult';

export interface GameServerService {
  ready(
    id: string,
    name: string,
    host: string,
    type: GameType,
    totalPlayers: number,
  ): Promise<EmptyObjectResult>;

  update(id: string, status: string): Promise<EmptyObjectResult>;
}

export interface UserMatchDto {
  id: string;
  email: string;
}

export interface NewMatchDto {
  id: string;
  host: string;
  users: UserMatchDto[];
}