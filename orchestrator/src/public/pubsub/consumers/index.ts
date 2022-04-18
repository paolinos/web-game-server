import { TOPIC } from "../topics";
import { AppConsumer, MatchConsumer } from "./consumer";

interface SearchGameMessage {
   id: string,
   email: string;
}

interface MatchReadyMessage {
   id: string,
   users: string[],
}

const app = new AppConsumer();
app.subscribeTo(TOPIC.SEARCH_GAME, async (message:SearchGameMessage) => {
   console.log(`Message: ${TOPIC.SEARCH_GAME} data:`, message);
});
app.subscribeTo(TOPIC.CANCEL_SEARCH_GAME, async (message:SearchGameMessage) => {
   console.log(`Message: ${TOPIC.CANCEL_SEARCH_GAME} data:`, message);
})
app.startToListenAsync();

const match = new MatchConsumer();
match.subscribeTo(TOPIC.MATCH_READY, async (message:MatchReadyMessage) => {
   console.log(`Message: ${TOPIC.MATCH_READY} data:`, message);
})
match.startToListenAsync();


console.log("Listening to pubsub message");