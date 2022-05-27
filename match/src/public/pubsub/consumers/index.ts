import { MATCH_ID } from "../../../consts";
import { TOPIC } from "../topics";
import { TopicConsumerManager } from "./consumer";
import matchService from "../../../application/services/match.service";


export interface GameServerAssignedMatchMessage {
    matchId: string;
    gameServerId: string;
    users: { id: string; email: string }[];
  }



const topicConsumerManager = new TopicConsumerManager();

// 
topicConsumerManager.consumeFromTopic(TOPIC.GAME_SERVER_ASSIGNED_TO_MATCH, async (data:Buffer) => {
    const message = JSON.parse(data.toString()) as GameServerAssignedMatchMessage;
	
    
    if(MATCH_ID !== message.gameServerId){
        console.info(`Message: ${TOPIC.GAME_SERVER_ASSIGNED_TO_MATCH} NOT FOR THIS MATHC - data:`, message);
        return;
    }

    console.log(`Message: ${TOPIC.GAME_SERVER_ASSIGNED_TO_MATCH} data:`, message);

    await matchService.init(message);

});