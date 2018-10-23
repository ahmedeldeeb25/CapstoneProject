import { expect } from "chai";

import {
    InsightResponse, InsightResponseSuccessBody,
    InsightDatasetKind, InsightDataset,
} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import * as fs from "fs";
import { promisify } from "util";

// This should match the JSON schema described in test/query.schema.json
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    response: InsightResponse;
    filename: string;  // This is injected when reading the file
}

async function remove_files(datasets: { [index: string]: string }): Promise<void> {
    const filesToRemove: Array<Promise<void>> = [];
    for (const file of Object.keys(datasets)) {
        if (await (promisify)(fs.exists)(`./${file}.json`)) {
            filesToRemove.push((promisify)(fs.unlink)(`./${file}.json`));
        }
    }
    await Promise.all(filesToRemove);
}

const datasetsToLoad: { [id: string]: string } = {
    courses: "./test/data/courses.zip",
    rooms: "./test/data/rooms.zip",
    test: "./test/data/test.zip",
    nonsense: "./test/data/nonsense.zip",
    test_rooms_1: "./test/data/rooms_test_valid.zip",
    test_rooms_2: "./test/data/rooms_test_invalid.zip",
};

const testCache: { [id: string]: object[] } = {};

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the Before All hook.

    let insightFacade: InsightFacade;
    let datasets: { [id: string]: string };

    before(async function () {
        Log.test(`Before: ${this.test.parent.title}`);
        try {
            const loadDatasetPromises: Array<Promise<Buffer>> = [];
            for (const [id, path] of Object.entries(datasetsToLoad)) {
                loadDatasetPromises.push(TestUtil.readFileAsync(path));
            }
            const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
            });
            datasets = Object.assign({}, ...loadedDatasets);
            expect(Object.keys(datasets)).to.have.length.greaterThan(0);
        } catch (err) {
            expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }

        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            insightFacade = err;
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    // remove the cached files
    after(async function () {
        Log.test(`After: ${this.test.parent.title}`);
        // await remove_files(datasetsToLoad);
        Log.test("cached files removed");
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    it("Should add a valid dataset", async () => {
        const id: string = "courses";
        const expectedCode: number = 204;
        let response: InsightResponse;

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            // const courses = JSON.parse(await (promisify)(fs.readFile)("./test/data/courses.json", "utf-8"));
            // insightFacade.set_cache({ courses });
            testCache["courses"] = insightFacade.get_cache()["courses"];
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
        }
    });

    it("Should add the dataset with type courses I created", async () => {
        let response: InsightResponse;
        const id: string = "test";
        const expected: number = 204;
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            testCache["test"] = insightFacade.get_cache()["test"];
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
        }
    });

    it("Should add an valid dataset of type rooms", async () => {
        let response: InsightResponse;
        const id: string = "rooms";
        const expected: number = 204;
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
            testCache["rooms"] = insightFacade.get_cache()["rooms"];
        } catch (err) {
            Log.test("Error occured: " + JSON.stringify(err));
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
        }
    });

    // it("Should add an valid custom dataset of type rooms", async () => {
    //     let response: InsightResponse;
    //     const id: string = "test_rooms_1";
    //     const expected: number = 204;
    //     try {
    //         response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
    //     } catch (err) {
    //         Log.test("Error occured: " + JSON.stringify(err));
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    // it("Should add an valid custom dataset of type rooms", async () => {
    //     let response: InsightResponse;
    //     const id: string = "test_rooms_2";
    //     const expected: number = 400;
    //     try {
    //         response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
    //     } catch (err) {
    //         Log.test("Error occured: " + JSON.stringify(err));
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    // it("Should not add an invalid dataset of type rooms", async () => {
    //     let response: InsightResponse;
    //     const id: string = "nonsense";
    //     const expected: number = 400;
    //     try {
    //         response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
    //     } catch (err) {
    //         Log.test("Error occured: " + JSON.stringify(err));
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    it("Should not add an invalid file", async () => {
        let response: InsightResponse;
        const id: string = "nonsense";
        const expected: number = 400;
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
        }
    });

    it("Should not add a dataset that doesn't exist: Courses", async () => {
        let response: InsightResponse;
        const expected: number = 400;
        const id: string = "foo";
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.deep.equal({ error: "file was not valid" });
        }
    });

    it("Should throw an error with an invalid file path: Rooms", async () => {
        let response: InsightResponse;
        const id: string = "courses";
        const expected: number = 400;
        try {
            response = await insightFacade.addDataset(id, "./test/data/foo.zip", InsightDatasetKind.Rooms);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.deep.equal({ error: "file was not valid" });
        }
    });

    it("Should not add the same dataset twice", async () => {
        const id: string = "courses";
        const expectedCode: number = 400;
        let response: InsightResponse;

        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
            expect(response.body).to.deep.equal({ error: "file was not valid" });
        }

    });

    // it("Should add the same dataset under a different id", async () => {
    //     const id: string = "courses";
    //     const fakeID: string = "courses_test";
    //     const expected: number = 204;
    //     let response: InsightResponse;
    //     try {
    //         response = await insightFacade.addDataset(fakeID, datasets[id], InsightDatasetKind.Courses);
    //     } catch (err) {
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    // This is an example of a pending test. Add a callback function to make the test run.
    // it("Should remove the courses dataset", async () => {
    //     const id: string = "courses";
    //     let response: InsightResponse;
    //     const expected: number = 204;
    //     try {
    //         response = await insightFacade.removeDataset(id);
    //     } catch (err) {
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    // it("Should remove the rooms dataset", async () => {
    //     const id: string = "rooms";
    //     let response: InsightResponse;
    //     const expected: number = 204;
    //     try {
    //         response = await insightFacade.removeDataset(id);
    //     } catch (err) {
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    it("Should remove the test dataset", async () => {
        const id: string = "test";
        let response: InsightResponse;
        const expected: number = 204;
        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
        }
    });

    it("Should return an error if param is null", async () => {
        let response: InsightResponse;
        const expected: number = 404;
        try {
            response = await insightFacade.removeDataset(null);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
        }
    });

    it("Should return an error if param is empty string", async () => {
        let response: InsightResponse;
        const expected: number = 404;
        try {
            response = await insightFacade.removeDataset("");
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
        }
    });

    it("Should return an error if the same dataset is removed twice", async () => {
        const id: string = "test";
        let response: InsightResponse;
        const expected: number = 404;
        try {
            await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
            response = await insightFacade.removeDataset(id);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.deep.equal({ error: "dataset doesn't exist" });
        }
    });

    it("Should not remove a databse that isn't there", async () => {
        const id: string = "telephones";
        let response: InsightResponse;
        const expected: number = 404;
        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.deep.equal({ error: "dataset doesn't exist" });
        }
    });

    // it("Should remove the duplicate dataset made under a different name", async () => {
    //     const id: string = "courses_test";
    //     let response: InsightResponse;
    //     const expected: number = 204;
    //     try {
    //         response = await insightFacade.removeDataset(id);
    //     } catch (err) {
    //         response = err;
    //     } finally {
    //         expect(response.code).to.equal(expected);
    //     }
    // });

    it("Should return an error if a query is performed on a removed database", async () => {
        let response: InsightResponse;
        const expected: number = 400;
        try {
            response = await insightFacade.performQuery("In courses dataset test, find all entries; show ID.");
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.deep.equal({ error: "dataset not found" });
        }
    });

});

describe("IInsightFacade listDatasets", () => {

    let insightFacade: InsightFacade;

    before(async () => {
        Log.test("cached files removed");
        insightFacade = new InsightFacade();
    });

    it("should return an array of length 0 if no datasets are added", async () => {
        let response: InsightResponse;
        const expectedCode: number = 200;
        const expectedLength: number = 0;
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
            expect((response.body as InsightResponseSuccessBody).result.length).to.equal(expectedLength);
        }
    });

    it("should return an array of length 1 if 1 dataset is added", async () => {
        let response: InsightResponse;
        const expectedCode: number = 200;
        const expectedLength: number = 1;
        try {
            const buffer: Buffer = await (promisify)(fs.readFile)("./test/data/small_test.zip");
            const content: string = buffer.toString("base64");
            await insightFacade.addDataset("small_test", content, InsightDatasetKind.Courses);
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
            expect((response.body as InsightResponseSuccessBody).result.length).to.equal(expectedLength);
        }
    });

});

// This test suite dynamically generates tests from the JSON files in test/queries.
// You should not need to modify it; instead, add additional files to the queries directory.
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        test: "./test/data/test.zip",
        rooms: "./test/data/rooms.zip",
    };

    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];
    // Create a new instance of InsightFacade, read in the test queries from test/queries and
    // add the datasets specified in datasetsToQuery.
    before(async function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = await TestUtil.readTestQueries();
            expect(testQueries).to.have.length.greaterThan(0);
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${JSON.stringify(err)}`);
        }

        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            insightFacade = err;
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Fail if there is a problem reading ANY dataset.
        // just using the cached results from the add/remove part to make this faster
        try {
            insightFacade.set_cache(testCache);
            // }
        } catch (err) {
            expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`AfterTest: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    it("Should run test queries", async () => {
        describe("Dynamic InsightFacade PerformQuery tests", async () => {

            after("remove files", async () => {
                // await remove_files(datasetsToLoad);
            });

            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, async () => {
                    let response: InsightResponse;
                    try {
                        response = await insightFacade.performQuery(test.query);
                    } catch (err) {
                        response = err;
                    } finally {
                        expect(response.code).to.equal(test.response.code);

                        if (test.response.code >= 400) {
                            expect(response.body).to.have.property("error");
                        } else {
                            expect(response.body).to.have.property("result");
                            const expectedResult = (test.response.body as InsightResponseSuccessBody).result;
                            const actualResult = (response.body as InsightResponseSuccessBody).result;
                            expect(actualResult).to.deep.equal(expectedResult);
                        }
                    }
                });
            }
        });
    });

});
