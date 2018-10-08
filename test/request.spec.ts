import { expect } from "chai";
import Request from "../src/controller/consumer/request";
import { IGeoResponse } from "../src/controller/consumer/request";
describe("Request", () => {

    it("Should be able to return JSON response with given url", async () => {
        const address: string = "2356 Main Mall";
        const uri: string = encodeURI(address);
        const request: Request = new Request();
        let response: IGeoResponse;
        try {
            response = await request.getCoords(uri);
        } catch (err) {
            response = err;
        }
        const expected: IGeoResponse = { lat: 49.26176, lon: -123.24935 };
        expect(response).to.deep.equal(expected);
    });

});
