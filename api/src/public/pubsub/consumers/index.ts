import { TOPIC } from "../topics";
import { MatchConsumer } from "./consumer";


const matchConsumer = new MatchConsumer();

matchConsumer.consumeFromTopic(TOPIC.MATCH_INIT, (message) => {
   console.log("message:", message);

   // TODO: update users 
})
matchConsumer.consumeFromTopic(TOPIC.MATCH_END, (message) => {
   console.log("message:", message);
   
   // TODO: Save points
   
})