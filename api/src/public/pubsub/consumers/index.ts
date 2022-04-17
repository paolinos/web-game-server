import { TOPIC_MATCH_INIT } from "../../../consts";
import { MatchConsumer } from "./consumer";


const matchConsumer = new MatchConsumer();
matchConsumer.on(TOPIC_MATCH_INIT, (message) => {
   console.log("message:", message); 
});