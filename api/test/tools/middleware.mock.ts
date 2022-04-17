import { UserSession } from '../../src/application/interfaces/userSession.interface';
import * as tokenTools from '../../src/public/api/tools/token.tools';

export const createAuthorizedUserMiddlewareMock = (token:string, userSession:UserSession|null) => {
    const getBearerTokenFromRequestMock = jest.spyOn(tokenTools, 'getBearerTokenFromRequest').mockImplementation((req) => {
        return token
    });

    const parseTokenMock = jest.spyOn(tokenTools, 'parseToken').mockImplementation(() => userSession);

    return {
        getBearerTokenFromRequestMock,
        parseTokenMock
    }
}