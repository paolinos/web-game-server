import "reflect-metadata";
import { UserModel } from "../../../../src/domain/models/user.model";
import { IUserRepository } from "../../../../src/infrastructure/db/user.repository";

class UserRepositoryMock implements IUserRepository {
    getByEmail(_email: string): Promise<UserModel | undefined> {
        throw new Error("Method not implemented.");
    }
    addUser(_email: string, _password: string, _token?: string): Promise<UserModel> {
        throw new Error("Method not implemented.");
    }
    updateUser(_user: UserModel): Promise<void> {
        throw new Error("Method not implemented.");
    }
    deleteUser(_email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
export const userRepositoryMock = new UserRepositoryMock();

export const getByEmailSpy = () => {
    return jest.spyOn(userRepositoryMock, "getByEmail");
}
export const getByEmailMock = (dto?:UserModel) => {
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
    spy.mockImplementation((user:UserModel) => { 
        if(user.email !== userEmail || !user.token) throw new Error("User is invalid or missing token");
        return Promise.resolve();
    });
    return spy;
}