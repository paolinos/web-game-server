import RestApi from "./public/http/rest-api";

//import './pubsub/consumers';

const runAsync = async (): Promise<void> => {
	console.log(`Service running at:${new Date().toISOString()}`);

	RestApi.init().listen();
};

runAsync();
