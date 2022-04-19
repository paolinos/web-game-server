import { UserService } from "../../../application/interfaces/user.service.interface";
import { UserBusinessLogic } from "../../../application/services/user.service";
import { TOPIC } from "../topics";
import { AppConsumer, MatchConsumer } from "./consumer";
import ContextUnitOfWork from '../../../repositories/unitOfWork';

interface SearchGameMessage {
   id: string,
   email: string;
}

interface MatchReadyMessage {
   id: string,
   users: string[],
}

const app = new AppConsumer();
const userService:UserService = new UserBusinessLogic(ContextUnitOfWork.UserRepository);

app.subscribeTo(TOPIC.SEARCH_GAME, async (message:SearchGameMessage) => {
   console.log(`Message: ${TOPIC.SEARCH_GAME} data:`, message);

   const result = await userService.searchGame(message.id, message.email);
   if(!result.isValid()){
      const errorMessage = "Error trying to Add User to search a game."
      console.error(errorMessage, result.error);
      throw new Error(errorMessage);
   }
});
app.subscribeTo(TOPIC.CANCEL_SEARCH_GAME, async (message:SearchGameMessage) => {
   console.log(`Message: ${TOPIC.CANCEL_SEARCH_GAME} data:`, message);

   const result = await userService.cancelSearchGame(message.id);
   if(!result.isValid()){
      const errorMessage = "Error trying to Remove User to search a game."
      console.error(errorMessage, result.error);
      throw new Error(errorMessage);
   }
})
app.startToListenAsync();

const match = new MatchConsumer();
match.subscribeTo(TOPIC.MATCH_READY, async (message:MatchReadyMessage) => {
   console.log(`Message: ${TOPIC.MATCH_READY} data:`, message);
})
match.startToListenAsync();


console.log("Listening to pubsub message");