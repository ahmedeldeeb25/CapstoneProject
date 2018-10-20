import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import * as fs from "fs";
import { promisify } from "util";
import Log from "../src/Util";
describe("Facade D3", function () {
    const URL: string = "http://localhost:4321";
    let facade: InsightFacade = null;
    let server: Server = null;
    let roomsBuffer: Buffer;
    let coursesBuffer: Buffer;
    chai.use(chaiHttp);

    before(async function () {
        facade = new InsightFacade();
        server = new Server(4321);
        try {
            roomsBuffer = await (promisify)(fs.readFile)("./test/data/rooms.zip");
            coursesBuffer = await (promisify)(fs.readFile)("./test/data/courses.zip");
        } catch (err) {
            throw Error("Error occurred!" + err);
        }
        server.start();
    });

    after(function () {
        // TODO: stop server here once!
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test("TEST STARTING");
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test("TEST ENDING");
    });

    it("PUT test for courses dataset", function () {
        try {
            return chai.request(URL)
                .put("/dataset/courses/courses")
                .send({file: coursesBuffer })
                .then(function (res: any) {
                    // some logging here please!
                    chai.expect(res.status).to.be.equal(204);
                })
                .catch(function (err: any) {
                    // some logging here please!
                    Log.test("Error occured" + err);
                    throw Error("fail");
                    // chai.expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.test("Error occured!" + err);
            throw Error("fail");
        }
    });

    it("PUT test for rooms dataset", function () {
        try {
            return chai.request(URL)
                .put("/dataset/rooms/rooms")
                .send({file: roomsBuffer})
                .then(function (res: any) {
                    // some logging here please!
                    chai.expect(res.status).to.be.equal(204);
                })
                .catch(function (err: any) {
                    // some logging here please!
                    Log.test("Error occured" + err);
                    throw Error("fail!");
                    // chai.expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.test("Error occured!" + err);
            throw Error("Fail!");
        }
    });

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
