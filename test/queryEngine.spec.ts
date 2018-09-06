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
    before("Before Query", async () => {
        id = "small_test";
        const filename: string = "./test/data/small_test.zip";
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content = buffer.toString("base64");
        const parser: Parser = new Parser(id, content);
        query = new QueryEngine(id);
        try {
            await query.set_data();
        } catch (err) {
            Log.test("error occurred getting data");
        }
    });

    after("After Query", async () => {
        if (await (promisify)(fs.exists)(`./src/cache/${id}.json`)) {
            await (promisify)(fs.unlink)(`./src/cache/${id}.json`);
        }
    });

    it("Should retrieve JSON object from .json file", async () => {
        const contents: object[] = [{ small_test_title: "gross anat limbs", small_test_id: "1845",
        small_test_professor: "alimohammadi, majid", small_test_audit: 0, small_test_year: "2013",
        small_test_course: 392, small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
        small_test_subject: "anat", small_test_section: "001" }, { small_test_title: "gross anat limbs",
        small_test_id: "1846", small_test_professor: "", small_test_audit: 0, small_test_year: "2013",
        small_test_course: 392, small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
        small_test_subject: "anat", small_test_section: "overall" }, { small_test_title: "gross anat limbs",
        small_test_id: "12690", small_test_professor: "alimohammadi, majid", small_test_audit: 0,
        small_test_year: "2014", small_test_course: 392, small_test_pass: 83, small_test_fail: 0,
        small_test_avg: 83.65, small_test_subject: "anat", small_test_section: "001" }];
        const expected: object[] = query.get_data();
        expect(expected).to.deep.equal(contents);
    });

    it("Should return all data if queried for all", () => {
        const contents: object[] = [{
            small_test_title: "gross anat limbs", small_test_id: "1845",
            small_test_professor: "alimohammadi, majid", small_test_audit: 0, small_test_year: "2013",
            small_test_course: 392, small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
            small_test_subject: "anat", small_test_section: "001",
        }, {
            small_test_title: "gross anat limbs",
            small_test_id: "1846", small_test_professor: "", small_test_audit: 0, small_test_year: "2013",
            small_test_course: 392, small_test_pass: 82, small_test_fail: 0, small_test_avg: 81.82,
            small_test_subject: "anat", small_test_section: "overall",
        }, {
            small_test_title: "gross anat limbs",
            small_test_id: "12690", small_test_professor: "alimohammadi, majid", small_test_audit: 0,
            small_test_year: "2014", small_test_course: 392, small_test_pass: 83, small_test_fail: 0,
            small_test_avg: 83.65, small_test_subject: "anat", small_test_section: "001",
        }];
        const splitQuery: SplitQuery = new SplitQuery("In courses dataset small_test, find all entries; " +
            "show Title and ID and Professor and Audit and " +
            "Year and Course and Pass and Fail and Average and Subject and Section.");
        const queryAST: IsplitQuery = splitQuery.get_split_query();
        const expected: object[] = query.query_data(queryAST);
        expect(contents).to.deep.equal(expected);
    });

    it("Should return specific data if queries for specific data", () => {
        const contents: object[] = [{
            small_test_title: "gross anat limbs",
            small_test_id: "12690",
        }];
        const splitQuery: SplitQuery = new SplitQuery("In courses dataset small_test, find entries whose " +
            "Average is equal to 83.65;" +
            " show Title and ID.");
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

});
