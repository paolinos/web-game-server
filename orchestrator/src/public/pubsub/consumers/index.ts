import { UserService } from '../../../application/interfaces/user.service.interface';
import { UserBusinessLogic } from '../../../application/services/user.service';
import { MatchService } from '../../../application/interfaces/match.service.interface';
import { MatchBusinessLogic } from '../../../application/services/match.service';
import { GameServerService } from '../../../application/interfaces/game-server.service.interface';
import { GameServerBusinessLogic } from '../../../application/services/game-server.service';

import { TOPIC } from '../topics';
import { AppConsumer, MatchConsumer, OrchestratorConsumer } from './consumer';
import ContextUnitOfWork from '../../../repositories/unitOfWork';
import {
  addQueueToSearchUsersToMatch,
  publishGameServerAssingedMatch,
  publishUsersAssingedMatch,
} from '../publishers/publisher';
import { GameType } from '../../../domain/game-server';

interface SearchGameMessage {
  id: string;
  email: string;
}

interface GameServerReadyMessage {
  id: string;
  name: string;
  host: string;
  type: string;
  totalPlayers: number;
}

const app = new AppConsumer();
const userService: UserService = new UserBusinessLogic(
  ContextUnitOfWork.UserRepository,
);
const matchService: MatchService = new MatchBusinessLogic(
  ContextUnitOfWork.UserRepository,
  ContextUnitOfWork.GameServerRepository,
  ContextUnitOfWork.MatchRepository,
);
const gameServerService: GameServerService = new GameServerBusinessLogic(
  ContextUnitOfWork.GameServerRepository,
);

app.subscribeTo(TOPIC.SEARCH_GAME, async (message: SearchGameMessage) => {
  console.log(`Message: ${TOPIC.SEARCH_GAME} data:`, message);

  // Add User
  const result = await userService.searchGame(message.id, message.email);
  if (!result.isValid()) {
    const errorMessage = 'Error trying to Add User to search a game.';
    console.error(errorMessage, result.error);
    //throw new Error(errorMessage);
    return;
  }

  await addQueueToSearchUsersToMatch();
});

app.subscribeTo(
  TOPIC.CANCEL_SEARCH_GAME,
  async (message: SearchGameMessage) => {
    console.log(`Message: ${TOPIC.CANCEL_SEARCH_GAME} data:`, message);

    const result = await userService.cancelSearchGame(message.id);
    if (!result.isValid()) {
      const errorMessage = 'Error trying to Remove User to search a game.';
      console.error(errorMessage, result.error);
      //throw new Error(errorMessage);
      return;
    }
  },
);
app.consumeFromTopic(TOPIC.SEARCH_GAME);
app.consumeFromTopic(TOPIC.CANCEL_SEARCH_GAME);

const orchestratorConsumer = new OrchestratorConsumer();
orchestratorConsumer.consumeFromQueue<{topic:string}>(async (data) => {
  console.log("Orchestrator - consumeFromQueue:", data);

  console.log(`Message: ${TOPIC.SEARCH_USERS_TO_MATCH}`);
  const matchResult = await matchService.createMatchIfPlayersAreReady();
  if (!matchResult.isValid()) {
    const errorMessage = 'Error trying to create Match';
    console.error(errorMessage, matchResult.error);
    return;
    //throw new Error(errorMessage);
  }

  if (matchResult.data !== null) {
    const users = matchResult.data.users.map((q) => ({
      id: q.id,
      email: q.email,
    }));

    await Promise.all([
      publishGameServerAssingedMatch({
        matchId: matchResult.data.id,
        gameServerId: matchResult.data.gameServerId,
        users,
      }),
      publishUsersAssingedMatch({
        matchId: matchResult.data.id,
        gameServerHost: matchResult.data.gameServerHost,
        users,
      }),
    ]);
  } else {
    console.warn('Still missing users to play');
  }

});


const match = new MatchConsumer();
match.subscribeTo(TOPIC.SEARCH_USERS_TO_MATCH, async () => {
  
});

match.subscribeTo(
  TOPIC.GAME_SERVER_READY,
  async (message: GameServerReadyMessage) => {
    console.log(`Message: ${TOPIC.GAME_SERVER_READY} data:`, message);

    const result = await gameServerService.ready(
      message.id,
      message.name,
      message.host,
      message.type as GameType,
      message.totalPlayers,
    );

    if (!result.isValid()) {
      const errorMessage = 'Error when GameServer set Ready';
      console.error(errorMessage, result.error);
      //throw new Error(errorMessage);
      return;
    }
  },
);
//match.consumeFromTopic(TOPIC.SEARCH_USERS_TO_MATCH);
match.consumeFromTopic(TOPIC.GAME_SERVER_READY);

console.log('Listening to pubsub message');