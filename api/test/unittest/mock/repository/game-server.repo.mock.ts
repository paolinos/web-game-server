import { GameServerEntity, IGameServerRepository } from "../../../../src/infrastructure/db/game-server.repository";

class GameServerRepositoryMock implements IGameServerRepository {
    

    getByName(name: string): Promise<GameServerEntity | undefined> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<GameServerEntity[]> {
        throw new Error("Method not implemented.");
    }
    add(id: string, name: string, host: string): Promise<GameServerEntity> {
        throw new Error("Method not implemented.");
    }
    update(gameServer: GameServerEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export const gameServerRepositoryMock:IGameServerRepository = new GameServerRepositoryMock();

export const getByNameSpy = () => {
    return jest.spyOn(gameServerRepositoryMock, "getByName");
}
export const getByNameMock = (data?:GameServerEntity) => {
    const spy = getByNameSpy();
    spy.mockImplementation(() => {
        return Promise.resolve(data);
    })
    return spy;
}
