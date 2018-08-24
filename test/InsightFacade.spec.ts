import { expect } from "chai";

import { InsightResponse, InsightResponseSuccessBody,
    InsightDatasetKind, InsightDataset } from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import { AsyncResource } from "async_hooks";

// This should match the JSON schema described in test/query.schema.json
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    response: InsightResponse;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the Before All hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
        test: "./test/data/test.zip",
        nonsense: "./test/data/nonsense.zip",
    };

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
            Log.error(err);
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
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
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
            expect(response).to.be.a("InsightResponse");
        }
    });

    it("Should add the dataset with type courses I created", async () => {
        let response: InsightResponse;
        const id: string = "tests";
        const expected: number = 204;
        try {
            response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response).to.be.a("InsightResponse");
        }
    });

    it("Should add an valid dataset of type rooms", async () => {
       let response: InsightResponse;
       const id: string = "rooms";
       const expected: number = 200;
       try {
           response = await insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
       } catch (err) {
           response = err;
       } finally {
           expect(response.code).to.equal(expected);
           expect(response).to.be.a("InsightResponse");
       }
    });

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
            expect(response).to.be.a("InsightResponse");
            expect(response.body).to.be("{'error': 'file is not a csv file'} ");
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
            expect(response).to.be.a("InsightResponse");
            expect(response.body).to.be("{ 'error': 'file does not exist'} ");
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
            expect(response).to.be.a("InsightResponse");
            expect(response.body).to.be("{'error': 'file does not exist'} ");
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
            expect(response).to.be.a("InsightResponse");
            expect(response.body).to.be("{'error': 'dataset with that id already exists'}");
        }

    });

    // This is an example of a pending test. Add a callback function to make the test run.
    it("Should remove the courses dataset", async () => {
        const id: string = "courses";
        let response: InsightResponse;
        const expected: number = 204;
        try {
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response).to.be.a("InsightResponse");
        }
    });

    it("Should return an error if the same dataset is removed twice", async () => {
        const id: string = "courses";
        let response: InsightResponse;
        const expected: number = 404;
        try {
            response = await insightFacade.removeDataset(id);
            response = await insightFacade.removeDataset(id);
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response).to.be.a("InsightResponse");
            expect(response.body).to.be("{ 'error': 'dataset does not exist' }");
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
            expect(response).to.be.a("InsightResponse");
            expect(response.body).to.be("{'error': 'dataset doesn't exist'}");
        }
    });

    it("Should return an error if a query is performed on a removed database", async () => {
        const id: string = "courses";
        let response: InsightResponse;
        const expected: number = 200;
        try {
            await insightFacade.removeDataset(id);
            response = await insightFacade.performQuery("In courses dataset courses, find all entries; show ID.");
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.deep.equal("{'error': 'my text'}");
        }
    });

    it("Should return a list of datasets and their types, dataset should be length 3", async () => {
        let response: InsightResponse;
        const expected: number = 200;
        try {
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expected);
            expect(response.body).to.be.an.instanceof(Array);
            const body: InsightResponseSuccessBody = response.body as InsightResponseSuccessBody;
            const dataset: InsightDataset[] = body.result as InsightDataset[];
            expect(dataset[0].id).to.equal("courses");
            expect(dataset[0].kind).to.equal(InsightDatasetKind.Courses);
            expect(dataset[0].numRows).to.be.a("number");
            expect(dataset.length).to.equal(datasetsToLoad.keys.length);
        }
    });

});

// This test suite dynamically generates tests from the JSON files in test/queries.
// You should not need to modify it; instead, add additional files to the queries directory.
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        tests: "./test/data/test.zip",
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
            Log.error(err);
        } finally {
            expect(insightFacade).to.be.instanceOf(InsightFacade);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Fail if there is a problem reading ANY dataset.
        try {
            const loadDatasetPromises: Array<Promise<Buffer>> = [];
            for (const [id, path] of Object.entries(datasetsToQuery)) {
                loadDatasetPromises.push(TestUtil.readFileAsync(path));
            }
            const loadedDatasets = (await Promise.all(loadDatasetPromises)).map((buf, i) => {
                return { [Object.keys(datasetsToQuery)[i]]: buf.toString("base64") };
            });
            expect(loadedDatasets).to.have.length.greaterThan(0);

            const responsePromises: Array<Promise<InsightResponse>> = [];
            const datasets: { [id: string]: string } = Object.assign({}, ...loadedDatasets);
            for (const [id, content] of Object.entries(datasets)) {
                responsePromises.push(insightFacade.addDataset(id, content, InsightDatasetKind.Courses));
            }

            // This try/catch is a hack to let your dynamic tests execute enough the addDataset method fails.
            // In D1, you should remove this try/catch to ensure your datasets load successfully before trying
            // to run you queries.
            try {
                const responses: InsightResponse[] = await Promise.all(responsePromises);
                responses.forEach((response) => expect(response.code).to.equal(204));
            } catch (err) {
                Log.warn(`Ignoring addDataset errors. For D1, you should allow errors to fail the Before All hook.`);
            }
        } catch (err) {
            expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    it("Should run test queries", () => {
        describe("Dynamic InsightFacade PerformQuery tests", () => {
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

describe("IInsightFacade listDatasets", () => {

    let insightFacade: InsightFacade;

    before( () => {
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
        const id: string = "courses";
        const filename: string = "./test/data/courses.zip";
        const kind: InsightDatasetKind = InsightDatasetKind.Courses;
        try {
            await insightFacade.addDataset(id, filename, kind);
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
            expect((response.body as InsightResponseSuccessBody).result.length).to.equal(expectedLength);
        }
    });

    it("should return an array of length 0 if 1 dataset is added but then removed", async () => {
        let response: InsightResponse;
        const expectedCode: number = 200;
        const expectedLength: number = 0;
        const id: string = "courses";
        const filename: string = "./test/data/courses.zip";
        const kind: InsightDatasetKind = InsightDatasetKind.Courses;
        try {
            await insightFacade.addDataset(id, filename, kind);
            await insightFacade.removeDataset(id);
            response = await insightFacade.listDatasets();
        } catch (err) {
            response = err;
        } finally {
            expect(response.code).to.equal(expectedCode);
            expect((response.body as InsightResponseSuccessBody).result.length).to.equal(expectedLength);
        }
    });
});
