import { IMatchMakerRepository, MatchMakerDataEntity } from "../../../../src/infrastructure/db/match-maker.repository";

class MatchMakerRepositoryMock implements IMatchMakerRepository {

    getUser(userId: string): Promise<MatchMakerDataEntity | undefined> {
        throw new Error("Method not implemented.");
    }
    addUser(gameName: string, userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    removeUser(...userIds: string[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getUsersAvailableByGame(gameName: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

}

export const matchMakerRepositoryMock:IMatchMakerRepository = new MatchMakerRepositoryMock();

export const getUserSpy = () => {
    return jest.spyOn(matchMakerRepositoryMock, "getUser");
}
export const getUserMock = (data?:MatchMakerDataEntity) => {
    const spy = getUserSpy();
    spy.mockImplementation(() => {
        return Promise.resolve(data);
    })
    return spy;
}

export const addUserSpy = () => {
    return jest.spyOn(matchMakerRepositoryMock, "addUser");
}
export const addUserMock = () => {
    const spy = addUserSpy();
    spy.mockImplementation(() => {
        return Promise.resolve();
    })
    return spy;
}

export const removeUserSpy = () => {
    return jest.spyOn(matchMakerRepositoryMock, "removeUser");
}
export const removeUserMock = () => {
    const spy = removeUserSpy();
    spy.mockImplementation(() => {
        return Promise.resolve();
    })
    return spy;
}

export const getUsersAvailableByGameSpy = () => {
    return jest.spyOn(matchMakerRepositoryMock, "getUsersAvailableByGame");
}
export const getUsersAvailableByGameMock = (data:string[]) => {
    const spy = getUsersAvailableByGameSpy();
    spy.mockImplementation(() => {
        return Promise.resolve(data);
    })
    return spy;
}