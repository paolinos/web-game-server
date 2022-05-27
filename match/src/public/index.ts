import './pubsub/consumers';
import matchService from '../application/services/match.service'

const run = async () => {
    matchService.ready();
}

run();
