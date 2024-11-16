import request from 'supertest';
import RestApi from "../../../src/public/http/rest-api";

beforeAll(() => {
    RestApi.init();
});

describe("Healthcheck Router", () => {

    test("when GET /healthcheck Should return the status of service", async () => {
        const response = await request(RestApi.app).get('/healthcheck')
            .set('Accept', 'application/json');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status")
        expect(response.body).toHaveProperty("at")
    })

});