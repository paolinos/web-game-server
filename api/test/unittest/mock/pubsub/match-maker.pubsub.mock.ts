import { IMatchMakerPub } from "../../../../src/infrastructure/pubsub/match-maker.pub";

class MatchMakerPubMock implements IMatchMakerPub {

    addUserToSearchGame(game: string, user_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export const matchMakerPubMock:IMatchMakerPub = new MatchMakerPubMock();

export const addUserToSearchGameSpy = () => {
    return jest.spyOn(matchMakerPubMock, "addUserToSearchGame");
}
export const addUserToSearchGameMock = () => {
    const spy = addUserToSearchGameSpy();
    spy.mockImplementation(() => {
        Promise.resolve();
    })
    return spy;
}
