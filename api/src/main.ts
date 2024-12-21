import iocContainer from "./ioc";
import WebApp from "./public/http/web-app";
import { IOC_TYPES } from "./ioc.types";
import { IMatchMakerSub } from "./infrastructure/pubsub/match-maker.sub";

//import './pubsub/consumers';

const startConsumers = async () => {
	await Promise.all([
		iocContainer.get<IMatchMakerSub>(IOC_TYPES.MatchMakerSub).startListening(),
	]);
};

const runAsync = async (): Promise<void> => {
	console.log(`Service running at:${new Date().toISOString()}`);

	await startConsumers();
	WebApp.init().listen();
};

runAsync();
