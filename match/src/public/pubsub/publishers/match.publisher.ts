import { TOPIC } from "../topics";
import { publishTopic } from "./publisher";


interface GameServerReadyMessage {
    id: string;
    name: string;
    host: string;
    type: string;
    totalPlayers: number;
}

export const publishMatchReady = async (payload: GameServerReadyMessage): Promise<void> => {
    const message = {
      topic: TOPIC.GAME_SERVER_READY,
      ...payload,
    };
  
    publishTopic(TOPIC.GAME_SERVER_READY, message);
};


export interface MatchEndMessage {
	id: string;
    type: string;
	players: {id:string, email: string, points:number}[],
	status: string,	// Ended, error,
	playersWins: string[],
	typeOfEnd: 'draw' | 'player-win'
} 
export const publishMatchEnd = async ( payload: MatchEndMessage ): Promise<void> => {
	const message = {
		topic: TOPIC.MATCH_END,
		...payload,
	};

	publishTopic(TOPIC.MATCH_END, message);
};