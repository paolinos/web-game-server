import "reflect-metadata";
import { UserModel } from "../../../../src/domain/models/user.model";
import { IUserRepository, UserEntity } from "../../../../src/infrastructure/db/user.repository";

class UserRepositoryMock implements IUserRepository {
    async getByEmail(_email: string): Promise<UserEntity | undefined> {
        throw new Error("Method not implemented.");
    }
    async addUser(_email: string, _password: string, _token?: string): Promise<UserEntity> {
        throw new Error("Method not implemented.");
    }
    async updateUser(_user: UserEntity): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async deleteUser(_email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
export const userRepositoryMock:IUserRepository = new UserRepositoryMock();

export const getByEmailSpy = () => {
    return jest.spyOn(userRepositoryMock, "getByEmail");
}
export const getByEmailMock = (dto?:UserEntity) => {
    const spy = getByEmailSpy();
    spy.mockImplementation((email:string) => { 
        if(dto){
            if(email !== dto.email) throw new Error("Email property is invalid");
        }
        return Promise.resolve(dto);
    });
    return spy;
}

export const addUserSpy = () => {
    return jest.spyOn(userRepositoryMock, "addUser");
}
export const addUserMock = (userEmail:string, userPassword:string) => {
    const spy = addUserSpy();
    spy.mockImplementation((email:string, password:string) => {
        if(email !== userEmail || password !== userPassword) throw new Error("Email and Password properties are invalid");
        return Promise.resolve({email, password, lastAccess:new Date(), token:undefined})
    });
    return spy;
}


export const updateUserSpy = () => {
    return jest.spyOn(userRepositoryMock, "updateUser");
}
export const updateUserMock = (userEmail:string) => {
    const spy = updateUserSpy();
    spy.mockImplementation((user:UserEntity) => { 
        if(user.email !== userEmail || !user.token) throw new Error("User is invalid or missing token");
        return Promise.resolve();
    });
    return spy;
}