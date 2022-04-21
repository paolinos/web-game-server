
export enum TOPIC {
    SEARCH_GAME = "topic-search-game",
    CANCEL_SEARCH_GAME = "topic-cancel-search-game",

    CREATED_MATCH = "topic-created-match",
    // MATCH_FORCE_RESTART => Cancel match, forcing restart the app, and be ready to host a new match 
    FORCE_RESTART_MATCH = "topic-force-restart-match",

    //  MATCH_READY -> after match start or after end the match, when is ready to host new match will send this message
    MATCH_READY = "topic-match-ready",
    MATCH_INIT = "topic-match-init",
    MATCH_END = "topic-match-end",
    // MATCH_ERROR => match notify the error that can have.
    MATCH_ERROR = "topic-match-error"
}