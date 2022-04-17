import { HttpApi } from './api';

//
import './pubsub/consumers';

const api = new HttpApi();
api.run();