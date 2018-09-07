import { expect } from "chai";
import QueryEngine from "../src/controller/queryEngine/retrieveResults";
import { IsplitQuery, SplitQuery } from "../src/controller/queryAST/splitQuery";
import Log from "../src/Util";
import Parser from "../src/controller/consumer/parser";
import { promisify } from "util";
import * as fs from "fs";

describe("Query Engine", () => {
    let query: QueryEngine;
    let id: string;
    let newQuery: QueryEngine;
    const customContents: object[] = [{
        sorted_title: "highest", sorted_uuid: "1845",
        sorted_instructor: "thomas anderson", sorted_audit: 0, sorted_year: "2013",
        sorted_id: "392", sorted_pass: 82, sorted_fail: 0, sorted_avg: 105,
        sorted_dept: "anat", sorted_section: "001",
    }, {
        sorted_title: "lowest",
        sorted_uuid: "1846", sorted_instructor: "billy bob thorton", sorted_audit: 0, sorted_year: "2013",
        sorted_id: "392", sorted_pass: 82, sorted_fail: 0, sorted_avg: 4,
        sorted_dept: "anat", sorted_section: "overall",
    }, {
        sorted_title: "middle",
        sorted_uuid: "12690", sorted_instructor: "sam bob boo", sorted_audit: 0,
        sorted_year: "2014", sorted_id: "392", sorted_pass: 83, sorted_fail: 0,
        sorted_avg: 75, sorted_dept: "anat", sorted_section: "001",
    }];
    const sorted = "sorted";
    before("Before Query", async () => {
        id = "small_test";
        const filename: string = "./test/data/small_test.zip";
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content = buffer.toString("base64");
        const parser: Parser = new Parser(id, content);
        query = new QueryEngine(id);

        try {
            const data: object[] = await parser.parse_data();
            await parser.store_data(data);
            await query.set_data();
        } catch (err) {
            Log.test("error occurred getting data");
        }
    });

    after("After Query", async () => {
        const ids: string[] = ["sorted", id];
        for (const i of ids) {
            if (await (promisify)(fs.exists)(`./src/cache/${i}.json`)) {
                await (promisify)(fs.unlink)(`./src/cache/${i}.json`);
            }
        }
    });

    it("Should retrieve JSON object from .json file", async () => {
        const contents: object[] = [{ small_test_title: "gross anat limbs", small_test_uuid: "1845",
        small_test_instructor: "alimohammadi, majid", small_test_audit: 0, small_test_year: "2013",
        small_test_id: "392", small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
        small_test_dept: "anat", small_test_section: "001" }, { small_test_title: "gross anat limbs",
        small_test_uuid: "1846", small_test_instructor: "", small_test_audit: 0, small_test_year: "2013",
        small_test_id: "392", small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
        small_test_dept: "anat", small_test_section: "overall" }, { small_test_title: "gross anat limbs",
        small_test_uuid: "12690", small_test_instructor: "alimohammadi, majid", small_test_audit: 0,
        small_test_year: "2014", small_test_id: "392", small_test_pass: 83, small_test_fail: 0,
        small_test_avg: 83.65, small_test_dept: "anat", small_test_section: "001" }];
        const expected: object[] = query.get_data();
        expect(expected).to.deep.equal(contents);
    });

    it("Should return all data if queried for all", () => {
        const contents: object[] = [{
            small_test_title: "gross anat limbs", small_test_uuid: "1845",
            small_test_instructor: "alimohammadi, majid", small_test_audit: 0, small_test_year: "2013",
            small_test_id: "392", small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
            small_test_dept: "anat", small_test_section: "001",
        }, {
            small_test_title: "gross anat limbs",
            small_test_uuid: "1846", small_test_instructor: "", small_test_audit: 0, small_test_year: "2013",
            small_test_id: "392", small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
            small_test_dept: "anat", small_test_section: "overall",
        }, {
            small_test_title: "gross anat limbs",
            small_test_uuid: "12690", small_test_instructor: "alimohammadi, majid", small_test_audit: 0,
            small_test_year: "2014", small_test_id: "392", small_test_pass: 83, small_test_fail: 0,
            small_test_avg: 83.65, small_test_dept: "anat", small_test_section: "001",
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
            small_test_title: "gross anat limbs",
            small_test_uuid: "12690",
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
        await (promisify)(fs.writeFile)("./src/cache/sorted.json", JSON.stringify(customContents));
        newQuery = new QueryEngine(sorted);
        await newQuery.set_data();
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
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

    it("Should be able to get data that contains a piece of a string", async () => {
        newQuery = new QueryEngine(sorted);
        await newQuery.set_data();
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
        await newQuery.set_data();
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
        await newQuery.set_data();
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

    it("Should be able to get data that does not match the string", async () => {
        newQuery = new QueryEngine(sorted);
        await newQuery.set_data();
        const expected: object[] = [{
            sorted_title: "middle",
        }];
        const q: string = "In courses dataset courses, " +
            "find entries whose Year is not \"2013\"; show Title.";
        const splitQuery = new SplitQuery(q);
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const data: object[] = newQuery.query_data(queryAST);
        expect(data).to.deep.equal(expected);
    });

});

describe("Course data", () => {
    const queryEngine: QueryEngine = new QueryEngine("courses");
    before("load data if it doesn't exist", async () => {
        if (! await (promisify)(fs.exists)("./src/cache/courses.json")) {
            const buffer: Buffer = await (promisify)(fs.readFile)("./src/data/courses.zip");
            const content = buffer.toString("base64");
            const parser: Parser = new Parser("courses", content);
            const data: object[] = await parser.parse_data();
            await parser.store_data(data);
        } else {
            Log.test("data already exists");
        }
        await queryEngine.set_data();
    });

    it("Should have 49044 entries", () => {
        const expected: number = 49044;
        expect(queryEngine.get_data().length).to.equal(expected);
    });

    it("Should match the 1st query", () => {
        const query: string = "In courses dataset courses, find entries whose Title begins with \"ab\";" +
        " show ID and Instructor and Title.";
        const splitQuery = new SplitQuery(query);
        const data: object[] = queryEngine.query_data(splitQuery.get_split_query());
        // for (const entry of data as Array<{[name: string]: string | number }>) {
        //     Log.test("id: " + entry["courses_id"] + " instructor: " + entry["courses_instructor"]
        //      + "title: " + entry["courses_title"]);
        // }
        expect(data.length).to.equal(63);
    });

});