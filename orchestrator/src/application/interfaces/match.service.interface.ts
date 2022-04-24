import { Match } from '../../domain/match';
import { ObjectResult } from '../objectResult';

export interface MatchService {
  createMatchIfPlayersAreReady(): Promise<ObjectResult<Match | null>>;
}
