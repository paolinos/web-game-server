import { TOPIC } from "../topics";
import { publishTopic } from "./publisher";


interface GameServerReadyMessage {
    id: string;
    name: string;
    host: string;
    type: string;
    totalPlayers: number;
  }

export const publishMatchReady = async (
    payload: GameServerReadyMessage,
  ): Promise<void> => {
    const message = {
      topic: TOPIC.GAME_SERVER_READY,
      ...payload,
    };
  
    publishTopic(TOPIC.GAME_SERVER_READY, message);
  };