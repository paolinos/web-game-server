import * as tokenTools from '../../src/public/api/tools/token.tools';


export const createGenerateTokenMock = (token:string) => {
    return jest.spyOn(tokenTools, 'generateToken').mockImplementation(() => token);
}
