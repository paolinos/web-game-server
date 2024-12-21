import "reflect-metadata";
import { LANG } from '../../../../src/lang';
import { MatchMakerBusiness, IMatchMakerBusiness } from "../../../../src/core/business/match-maker.business";
import { getByEmailMock, userRepositoryMock } from "../../mock/repository/user.repo.mock";
import { addUserMock, getUserMock, getUsersAvailableByGameMock, matchMakerRepositoryMock } from "../../mock/repository/match-maker.repo.mock";
import { addUserToSearchGameMock, matchMakerPubMock } from "../../mock/pubsub/match-maker.pubsub.mock";
import { gameServerRepositoryMock, getByNameMock, getByNameSpy } from "../../mock/repository/game-server.repo.mock";
import { UserEntity } from "../../../../src/infrastructure/db/user.repository";
import { GameServerEntity } from "../../../../src/infrastructure/db/game-server.repository";
import { MatchMakerDataEntity } from "../../../../src/infrastructure/db/match-maker.repository";

describe("MatchMakerBusiness", () => {
    
    const matchMakerBusiness:IMatchMakerBusiness = new MatchMakerBusiness(
        userRepositoryMock,
        matchMakerRepositoryMock,
        gameServerRepositoryMock,
        matchMakerPubMock
    );

    const mockUser:UserEntity = {
        id: "u1",
        email: "email@fake.com",
        password: "pass",
        lastAccess: new Date()
    }
    const mockGameServer:GameServerEntity = {
        id: "gs1",
        name: "game-two-players",
        host: "0.0.0.0",
        lastUpdate: new Date(),
        timestamp: 0,
        requirements: {
            players_required: 2
        }
    }

    describe("searchGame", () => {

        test("When a valid user search for a existent game Should send notification to search the game", async () => {
            
            const mockGetByEmail = getByEmailMock(mockUser);
            const mockGetGameServer = getByNameMock(mockGameServer);
            const mockAddUserToSearchGame = addUserToSearchGameMock();

            const searchGameResult = await matchMakerBusiness.searchGame(mockUser.email, mockGameServer.name);

            expect(searchGameResult).toBeUndefined();

            expect(mockGetByEmail).toHaveBeenCalledTimes(1);
            expect(mockGetGameServer).toHaveBeenCalledTimes(1);
            expect(mockAddUserToSearchGame).toHaveBeenCalledTimes(1);
        })

        test("When user not exist Should return an error", async () => {
            
            getByEmailMock();

            const searchGameResult = await matchMakerBusiness.searchGame("invalid@mail.com", mockGameServer.name);

            expect(searchGameResult).toBeInstanceOf(Error);
            expect(searchGameResult.message).toBe(LANG.ERROR.USER.NOT_FOUND);
        })

        test("When game not exist Should return an error", async () => {
            
            getByEmailMock(mockUser);
            getByNameMock();

            const searchGameResult = await matchMakerBusiness.searchGame(mockUser.email, "invalid game");

            expect(searchGameResult).toBeInstanceOf(Error);
            expect(searchGameResult.message).toBe(LANG.ERROR.GAME.NOT_FOUND);
        })
    })

    describe("userSearchingForMatch", () => {

        const machMakerUser:MatchMakerDataEntity = {
            id: "mm01",
            gameName: mockGameServer.name,
            userId: mockUser.id,
            timestamp: 0
        }

        test("when user is searching for a match but is the first", async () => {

            const mockGetByName = getByNameMock(mockGameServer);
            const mockGetUser = getUserMock();
            const mockAddUser = addUserMock();
            const mockGetUsersAvailableByGame = getUsersAvailableByGameMock([machMakerUser.userId])

            await matchMakerBusiness.userSearchingForMatch(mockGameServer.name, mockUser.id);

            expect(mockGetByName).toHaveBeenCalledTimes(1);
            expect(mockGetUser).toHaveBeenCalledTimes(1);
            expect(mockAddUser).toHaveBeenCalledTimes(1);
            expect(mockGetUsersAvailableByGame).toHaveBeenCalledTimes(1);  
        })
    });

})