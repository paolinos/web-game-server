import { UserService } from '../../../application/interfaces/user.service.interface';
import { UserBusinessLogic } from '../../../application/services/user.service';
import { MatchService } from '../../../application/interfaces/match.service.interface';
import { MatchBusinessLogic } from '../../../application/services/match.service';
import { GameServerService } from '../../../application/interfaces/game-server.service.interface';
import { GameServerBusinessLogic } from '../../../application/services/game-server.service';

import { TOPIC } from '../topics';
import { 
  BaseQueueConsumer,
  TopicConsumerManager 
} from './consumer';
import ContextUnitOfWork from '../../../repositories/unitOfWork';
import {
  addQueueToSearchUsersToMatch,
  publishGameServerAssingedMatch,
  publishUsersAssingedMatch,
} from '../publishers/publisher';
import { GameType } from '../../../domain/game-server';
import { RABBIT_QUEUE_ORCHESTRATOR } from '../../../consts';

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

const topicConsumer = new TopicConsumerManager();

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




topicConsumer.consumeFromTopic(TOPIC.SEARCH_GAME, async (data) => {

  const message = JSON.parse(data.toString());
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

topicConsumer.consumeFromTopic(TOPIC.CANCEL_SEARCH_GAME, async (data) => {

    const message = JSON.parse(data.toString());
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

const orchestratorConsumer = new BaseQueueConsumer(RABBIT_QUEUE_ORCHESTRATOR);
orchestratorConsumer.consumeFromQueue(async (data) => {
  console.log("Orchestrator - consumeFromQueue:", data.toString());

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


topicConsumer.consumeFromTopic( TOPIC.GAME_SERVER_READY, async (data) => {
  
    const message = JSON.parse(data.toString()) as GameServerReadyMessage;
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

console.log('Listening to pubsub message');