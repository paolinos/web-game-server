import request from 'supertest';
import RestApi from "../../../src/public/http/rest-api";
import MSG from '../../../src/message';

const VALID_EMAIL = "mail@user.com";
const VALID_PASSWORD = "pass"

beforeAll(() => {
    RestApi.init();
})

describe("Auth Router", () => {

    describe("POST /auth", () => {

        const postAuthRequest = (body:any) => {
            return request(RestApi.app).post('/auth')
                .set('Accept', 'application/json')
                .send(body);
        }

        test("when POST /auth Should return 201", async () => {
            const response  = await postAuthRequest({email: VALID_EMAIL, password: VALID_PASSWORD});

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token")
            expect(response.body.token).not.toBeUndefined();
        })

        test.each([
            {body:{}, msg:"empty body"},
            {body:{email:VALID_EMAIL}, msg:"without passowrd"},
            {body:{password:VALID_PASSWORD}, msg:"without email"},
            {body:{email:"", password:""}, msg:"with empty email & password"},
        ])
        // @ts-ignore
        ("when POST /auth with $msg Should return 422", async ({body, msg}) => {
            const response  = await postAuthRequest(body);

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty("error")
            expect(response.body.error).toBe(MSG.HTTP.VALIDATION.USERNAME_PASSWORD_INVALID)
        })
    })
})
