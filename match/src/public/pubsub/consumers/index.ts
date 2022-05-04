import { TOPIC } from "../topics";
import { TopicConsumerManager } from "./consumer";


const topicConsumerManager = new TopicConsumerManager();


// 
topicConsumerManager.consumeFromTopic(TOPIC.GAME_SERVER_ASSIGNED_TO_MATCH, (data:Buffer) => {

});