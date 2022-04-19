import { User } from "../../../src/domain/user";
import { UserBusinessLogic } from "../../../src/application/services/user.service";
import { UserRepository } from "../../../src/repositories/user.repository";


describe('User Service', () => { 

    describe('searchGame', () => {

        test('should be valid', async () => {
            
            const service = new UserBusinessLogic(new UserRepository());
            const result = await service.searchGame("test-id", "test-email");

            expect(result.isValid()).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should be invalid when user already is searching a match', async () => {
            const user = new User("test-id", "test-email");
            const userRepo = new UserRepository();
            userRepo.add(user);

            const service = new UserBusinessLogic(userRepo);
            const result = await service.searchGame(user.id, user.email);

            expect(result.isValid()).toBe(false);
            expect(result.error).toBe('User already exist');
        });

        test('should be invalid when repository throw error', async () => {
            const repo = new UserRepository();
            const errorMsg = "Mock error";

            const mock = jest.spyOn(repo, "getById").mockImplementation(() => {throw new Error(errorMsg)});

            const service = new UserBusinessLogic(repo);
            const result = await service.searchGame("test-id", "test-email");

            expect(result.isValid()).toBe(false);
            expect(result.error).toContain(errorMsg);
            expect(mock).toBeCalledTimes(1);
        });
    });


    describe('cancelSearchGame', () => {

        test('should be valid', async () => {
            const user = new User("test-id", "test-email");
            const userRepo = new UserRepository();
            userRepo.add(user);

            const service = new UserBusinessLogic(userRepo);
            const result = await service.cancelSearchGame(user.id);

            expect(result.isValid()).toBe(true);
            expect(result.error).toBeNull();
        });

        test('should be invalid when user not exist is searching a match', async () => {
            const service = new UserBusinessLogic(new UserRepository());
            const result = await service.cancelSearchGame("test-id");

            expect(result.isValid()).toBe(false);
            expect(result.error).toBe("User not exist");
        });

        test('should be invalid when repository throw error', async () => {
            const repo = new UserRepository();
            const errorMsg = "Mock error";

            const mock = jest.spyOn(repo, "removeById").mockImplementation(() => {throw new Error(errorMsg)});

            const service = new UserBusinessLogic(repo);
            const result = await service.cancelSearchGame("test-id");

            expect(result.isValid()).toBe(false);
            expect(result.error).toContain(errorMsg);
            expect(mock).toBeCalledTimes(1);
        });

    });
});