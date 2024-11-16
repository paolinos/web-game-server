import { 
    addUserMock, 
    addUserSpy, 
    getByEmailMock, 
    updateUserMock, 
    userRepositoryMock 
} from "../../mock/repository/user.repository.mock";
import { AuthBusiness } from "../../../../src/core/business/auth.business";
import { UserModel } from "../../../../src/domain/models/user.model";
import { verifyToken } from "../../../../src/common/token";

describe("AuthBusiness", () => {
    
    const EMAIL = "email@mail.com";
    const PASSWORD = "pass";
    const authBusiness = new AuthBusiness(
        userRepositoryMock
    );

    describe("authenticateUser", () => {

        test("When user not exist Then will insert the user and generate a token and update", async () => {
            const mockGetByEmail =  getByEmailMock();
            const mockAddUser = addUserMock(EMAIL, PASSWORD);
            const mockUpdateUser = updateUserMock(EMAIL);

            const authResponse = await authBusiness.authenticateUser({
                email: EMAIL,
                password: PASSWORD
            });

            expect(authResponse).not.toBeUndefined();
            expect(authResponse).toHaveProperty("token");
            expect(authResponse.token).not.toBeUndefined();
            
            expect(mockGetByEmail).toHaveBeenCalledTimes(1);
            expect(mockAddUser).toHaveBeenCalledTimes(1);
            expect(mockUpdateUser).toHaveBeenCalledTimes(1);
        });
        
        test("When user already exist Then will generate a token and update", async () => {

            const dto = {
                email: EMAIL, 
                password: PASSWORD, 
                lastAccess:new Date(), 
                token:undefined
            }
            const mockGetByEmail =  getByEmailMock(dto);
            const spyAddUser = addUserSpy();
            const mockUpdateUser = updateUserMock(EMAIL);

            const authResponse = await authBusiness.authenticateUser({
                email: dto.email,
                password: dto.password
            });

            expect(authResponse).not.toBeUndefined();
            expect(authResponse).toHaveProperty("token");
            expect(authResponse.token).not.toBeUndefined();
            
            expect(mockGetByEmail).toHaveBeenCalledTimes(1);
            expect(spyAddUser).toHaveBeenCalledTimes(0);
            expect(mockUpdateUser).toHaveBeenCalledTimes(1);
        });
        
        test.each([
            {msg:"user not exist", userExist: false},
            {msg:"user already exist", userExist: true}
        ])
        // @ts-ignore
        ("When $msg Then generated token should be valid", async ({msg, userExist}) => {

            let dto:UserModel|undefined=undefined;
            if(userExist){
                dto = {
                    email: EMAIL,
                    password: PASSWORD,
                    lastAccess: new Date()
                }
            }
            getByEmailMock(dto);
            addUserMock(EMAIL, PASSWORD);
            updateUserMock(EMAIL);
            const authResponse = await authBusiness.authenticateUser({
                email: EMAIL,
                password: PASSWORD
            });

            const data = verifyToken<{email:string}>(authResponse.token, true);
            expect(data).not.toBe(null);
            expect(data!.email).toBe(EMAIL);
        })
    })
});