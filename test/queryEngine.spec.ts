import { expect } from "chai";
import QueryEngine from "../src/controller/queryEngine/retrieveResults";
import { IsplitQuery, SplitQuery } from "../src/controller/queryAST/splitQuery";
import Log from "../src/Util";
import CVSParser from "../src/controller/consumer/parser_cvs";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import InsightFacade from "../src/controller/InsightFacade";
import { InsightDatasetKind } from "../src/controller/IInsightFacade";
import SplitGroupQuery from "../src/controller/queryAST/splitGroupedQuery";

describe("Query Engine", () => {
    let query: QueryEngine;
    let id: string;
    let newQuery: QueryEngine;
    const customContents: object[] = [{
        sorted_title: "highest", sorted_uuid: "1845",
        sorted_instructor: "thomas anderson", sorted_audit: 0, sorted_year: 2013,
        sorted_id: "392", sorted_pass: 82, sorted_fail: 0, sorted_avg: 105,
        sorted_dept: "anat", sorted_section: "001",
    }, {
        sorted_title: "lowest",
        sorted_uuid: "1846", sorted_instructor: "billy bob thorton", sorted_audit: 0, sorted_year: 1900,
        sorted_id: "392", sorted_pass: 82, sorted_fail: 0, sorted_avg: 4,
        sorted_dept: "anat", sorted_section: "overall",
    }, {
        sorted_title: "middle",
        sorted_uuid: "12690", sorted_instructor: "sam bob boo", sorted_audit: 0,
        sorted_year: 2014, sorted_id: "392", sorted_pass: 83, sorted_fail: 0,
        sorted_avg: 75, sorted_dept: "anat", sorted_section: "001",
    }];
    const sorted = "sorted";
    before("Before Query", async () => {
        id = "small_test_1";
        const filename: string = path.join(__dirname, "/data/small_test.zip");
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content = buffer.toString("base64");
        const parser: CVSParser = new CVSParser(id, content);
        query = new QueryEngine(id);

        try {
            const data: object[] = await parser.parse();
            // await parser.store_data(data);
            // await query.set_data();
            query.data_setter(data);
        } catch (err) {
            Log.test("error occurred getting data");
        }
    });

    it("Should retrieve JSON object from .json file", async () => {
        const contents: object[] = [{
            small_test_1_title: "gross anat limbs", small_test_1_uuid: "1845",
            small_test_1_instructor: "alimohammadi, majid", small_test_1_audit: 0, small_test_1_year: 2013,
            small_test_1_id: "392", small_test_1_pass: 82, small_test_1_fail: 0, small_test_1_avg: 81.82,
            small_test_1_dept: "anat", small_test_1_section: "001",
        }, {
            small_test_1_title: "gross anat limbs",
            small_test_1_uuid: "1846", small_test_1_instructor: "", small_test_1_audit: 0, small_test_1_year: 1900,
            small_test_1_id: "392", small_test_1_pass: 82, small_test_1_fail: 0, small_test_1_avg: 81.82,
            small_test_1_dept: "anat", small_test_1_section: "overall",
        }, {
            small_test_1_title: "gross anat limbs",
            small_test_1_uuid: "12690", small_test_1_instructor: "alimohammadi, majid", small_test_1_audit: 0,
            small_test_1_year: 2014, small_test_1_id: "392", small_test_1_pass: 83, small_test_1_fail: 0,
            small_test_1_avg: 83.65, small_test_1_dept: "anat", small_test_1_section: "001",
        }];
        const expected: object[] = query.get_data();
        expect(expected).to.deep.equal(contents);
    });

    it("Should return all data if queried for all", () => {
        const contents: object[] = [{
            small_test_1_title: "gross anat limbs", small_test_1_uuid: "1845",
            small_test_1_instructor: "alimohammadi, majid", small_test_1_audit: 0, small_test_1_year: 2013,
            small_test_1_id: "392", small_test_1_pass: 82, small_test_1_fail: 0, small_test_1_avg: 81.82,
            small_test_1_dept: "anat", small_test_1_section: "001",
        }, {
            small_test_1_title: "gross anat limbs",
            small_test_1_uuid: "1846", small_test_1_instructor: "", small_test_1_audit: 0, small_test_1_year: 1900,
            small_test_1_id: "392", small_test_1_pass: 82, small_test_1_fail: 0, small_test_1_avg: 81.82,
            small_test_1_dept: "anat", small_test_1_section: "overall",
        }, {
            small_test_1_title: "gross anat limbs",
            small_test_1_uuid: "12690", small_test_1_instructor: "alimohammadi, majid", small_test_1_audit: 0,
            small_test_1_year: 2014, small_test_1_id: "392", small_test_1_pass: 83, small_test_1_fail: 0,
            small_test_1_avg: 83.65, small_test_1_dept: "anat", small_test_1_section: "001",
        }];
        const splitQuery: SplitQuery = new SplitQuery("In courses dataset small_test, find all entries; " +
            "show Title and ID and Professor and Audit and " +
            "Year and UUID and Pass and Fail and Average and Department and Section.");
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const expected: object[] = query.query_data(queryAST);
        expect(contents).to.deep.equal(expected);
    });

    it("Should return specific data if queries for specific data", () => {
        const contents: object[] = [{
            small_test_1_title: "gross anat limbs",
            small_test_1_uuid: "12690",
        }];
        const splitQuery: SplitQuery = new SplitQuery("In courses dataset small_test, find entries whose " +
            "Average is equal to 83.65;" +
            " show Title and UUID.");
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const expected: object[] = query.query_data(queryAST);
        expect(contents).to.deep.equal(expected);
    });

    it("Should return nothing if nothing matches", () => {
        const contents: object[] = [];
        const splitQuery: SplitQuery = new SplitQuery("In courses dataset small_test, " +
            "find entries whose Title includes \"fuck you\"; show Fail and Pass and Section.");
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const expected: object[] = query.query_data(queryAST);
        expect(contents).to.deep.equal(expected);
    });

    it("Should be able to sort data", async () => {
        newQuery = new QueryEngine(sorted);
        newQuery.data_setter(customContents);
        const expected: object[] = [{
            sorted_title: "lowest",
        }, {
            sorted_title: "middle",
        }, {
            sorted_title: "highest",
        }];
        const q: string = "In courses dataset courses, " +
            "find all entries; show Title; sort in ascending order by Average.";
        const splitQuery = new SplitQuery(q);
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        Log.test(queryAST.order.toString());
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

    it("Should be able to get data that contains a piece of a string", async () => {
        newQuery = new QueryEngine(sorted);
        newQuery.data_setter(customContents);
        const expected: object[] = [{
            sorted_uuid: "1846",
        }, {
            sorted_uuid: "12690",
        }];
        const q: string = "In courses dataset courses, " +
            "find entries whose Instructor includes \"bob\"; show UUID.";
        const splitQuery = new SplitQuery(q);
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

    it("Should be able to get data the ends in a string", async () => {
        newQuery = new QueryEngine(sorted);
        newQuery.data_setter(customContents);
        const expected: object[] = [{
            sorted_title: "lowest",
        }];
        const q: string = "In courses dataset courses, " +
            "find entries whose Instructor ends with \"ton\"; show Title.";
        const splitQuery = new SplitQuery(q);
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

    it("Should be able to get data that starts with a string", async () => {
        newQuery = new QueryEngine(sorted);
        newQuery.data_setter(customContents);
        const expected: object[] = [{
            sorted_title: "highest",
        }];
        const q: string = "In courses dataset courses, " +
            "find entries whose Instructor begins with \"thom\"; show Title.";
        const splitQuery = new SplitQuery(q);
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

    it("Should be able to handle a query with or", async () => {
        newQuery = new QueryEngine(sorted);
        newQuery.data_setter(customContents);
        const expected: object[] = [{
            sorted_instructor: "sam bob boo",
        }, {
            sorted_instructor: "thomas anderson",
        }];
        const q: string = "In courses dataset courses, " +
            "find entries whose UUID is \"1845\" or UUID is \"12690\"; show Instructor.";
        const splitQuery = new SplitQuery(q);
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

});

describe("Course data", () => {
    const queryEngine: QueryEngine = new QueryEngine("courses");
    let data: object[];

    before("load data if it doesn't exist", async () => {
        const filename = path.join(__dirname, "..", "/src/data/courses.zip");
        const insightFacade = new InsightFacade();
        try {
            const buffer: Buffer = await (promisify)(fs.readFile)(filename);
            const content: string = buffer.toString("base64");
            await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
            data = insightFacade.get_cache()["courses"];
        } catch (err) {
            throw new Error("there was an error loading data");
        }
        queryEngine.data_setter(data);
    });

    it("Should have 49044 entries", () => {
        const expected: number = 49044;
        expect(queryEngine.get_data().length).to.equal(expected);
    });

    // it("Use to compare data between UI on SDMM and data my app gets", () => {
    //     const query: string = "In rooms dataset rooms grouped by Full Name,"
    //         + " find all entries; show Full Name and avg, where avg is the AVG of Seats.";
    //     const splitQuery = new SplitGroupQuery(query);
    //     const d: object[] = queryEngine.query_data(splitQuery.get_split_query());
    //     for (const c of d) {
    //         Log.test(JSON.stringify(c));
    //     }
    //     expect(data.length).to.equal(19);
    // });
});

describe("Rooms data", () => {
    const queryEngine: QueryEngine = new QueryEngine("rooms");
    let data: object[];

    before("load data if it doesn't exist", async () => {
        const filename = path.join(__dirname, "..", "/src/data/rooms.zip");
        const insightFacade = new InsightFacade();
        try {
            const buffer: Buffer = await (promisify)(fs.readFile)(filename);
            const content: string = buffer.toString("base64");
            await insightFacade.addDataset("rooms", content, InsightDatasetKind.Rooms);
            data = insightFacade.get_cache()["rooms"];
        } catch (err) {
            throw new Error("there was an error loading data");
        }
        queryEngine.data_setter(data);
    });

    it("Should have 49044 entries", () => {
        const expected: number = 284;
        expect(queryEngine.get_data().length).to.equal(expected);
        Log.test(JSON.stringify(queryEngine.get_data()));
    });

    it("Use to compare data between UI on SDMM and data my app gets", () => {
        const query: string = "In rooms dataset rooms grouped by Full Name,"
            + " find all entries; show Full Name and avg, where avg is the AVG of Seats.";
        const splitQuery = new SplitGroupQuery(query);
        const d: object[] = queryEngine.query_data(splitQuery.get_split_query());
        for (const c of d) {
            Log.test(JSON.stringify(c));
        }
        //  expect(data.length).to.equal(19);
    });
});
