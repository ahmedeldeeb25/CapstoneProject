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
                .attach("body", coursesBuffer, "courses.zip")
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
                .attach("body", roomsBuffer, "rooms.zip")
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

    it("POST test for query", function () {
        try {
            return chai.request(URL)
                .post("/query")
                .send({ query: "In courses dataset courses, find all entries; show ID." })
                .then(function (res: any) {
                    chai.expect(res.status).to.be.equal(200);
                })
                .catch(function (err: any) {
                    Log.test("Error occured" + err);
                    throw Error("fail!");
                });

        } catch (err) {
            Log.test("Error occurred " + err);
            throw Error("fail!");
        }
    });

    it("POST test for query REJECT bad query", function () {
        try {
            return chai.request(URL)
                .post("/query")
                .send({ query: "How now brown cow?" })
                .then(function (res: any) {
                    throw Error("unexpected!");
                })
                .catch(function (err: any) {
                    chai.expect(err.status).to.be.equal(400);
                });

        } catch (err) {
            Log.test("Error occurred " + err);
            throw Error("fail!");
        }
    });

    it("DEL test for courses dataset", function () {
        try {
            return chai.request(URL)
                .del("/dataset/courses")
                .then(function (res: any) {
                    chai.expect(res.status).to.be.equal(204);
                })
                .catch(function (err: any) {
                    Log.test("Error occured" + err);
                    throw Error("fail!");
                });

        } catch (err) {
            Log.test("Error occurred " + err);
            throw Error("fail!");
        }
    });

    it("DEL test for nonexistent dataset", function () {
        try {
            return chai.request(URL)
                .del("/dataset/moras")
                .then(function (res: any) {
                    throw Error("fail");
                })
                .catch(function (err: any) {
                    chai.expect(err.status).to.be.equal(404);
                });

        } catch (err) {
            Log.test("Error occurred " + err);
            throw Error("fail!");
        }
    });

    it("GET test for datasetlist", function () {
        try {
            return chai.request(URL)
                .get("/datasets")
                .then(function (res: any) {
                    chai.expect(res.status).to.be.equal(200);
                })
                .catch(function (err: any) {
                    Log.test("Error occured" + err);
                    throw Error("fail!");
                });

        } catch (err) {
            Log.test("Error occurred " + err);
            throw Error("fail!");
        }
    });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
