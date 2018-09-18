import { expect } from "chai";
import Validator from "../src/controller/consumer/validator";
import Parser from "../src/controller/consumer/parser";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

describe("Consumer valid_file validator", () => {
    let validator: Validator;

    it("Should return false if the file is not a zip", async () => {
        const filename: string = path.join(__dirname, "data", "nonsense.png");
        const foldername: string = "testfile";
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content = buffer.toString("base64");
        validator = new Validator(foldername, content);
        let value: boolean;
        try {
            value = await validator.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(false);
        }
    });

    it("Should return false if the file does not contain csv", async () => {
        const filename: string = path.join(__dirname, "data", "nonsense.zip");
        const foldername: string = "nonsense";
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content = buffer.toString("base64");
        validator = new Validator(foldername, content);
        let value: boolean;
        try {
            value = await validator.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(false);
        }
    });

    it("Should return true if the file is a valid zip file that contains csv", async () => {
        const filename: string = path.join(__dirname, "/data/courses.zip");
        const foldername: string = "courses_1";
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content = buffer.toString("base64");
        validator = new Validator(foldername, content);
        let value: boolean;
        try {
            value = await validator.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(true);
        }
    });

});

describe("Consumer Parser", () => {

    let parser: Parser;
    const filename: string = path.join(__dirname, "/data/small_test.zip");
    const id: string = "small_test_1";
    before("Before each", async () => {
        // assumes that file is valid
        const buffer: Buffer = await (promisify)(fs.readFile)(filename);
        const content: string = buffer.toString("base64");
        parser = new Parser(id, content);
    });

    after("After each", () => {
        // TODO: delete file made for cache
    });

    it("Should parse each line of a file and convert it into an object", async () => {
        const expected: object[] = [
            {
                small_test_1_title: "gross anat limbs",
                small_test_1_uuid: "1845",
                small_test_1_instructor: "alimohammadi, majid",
                small_test_1_audit: 0,
                small_test_1_year: "2013",
                small_test_1_id: "392",
                small_test_1_pass: 82,
                small_test_1_fail: 0,
                small_test_1_avg: 81.82,
                small_test_1_dept: "anat",
                small_test_1_section: "001",
            },
            {
                small_test_1_title: "gross anat limbs",
                small_test_1_uuid: "1846",
                small_test_1_instructor: "",
                small_test_1_audit: 0,
                small_test_1_year: "2013",
                small_test_1_id: "392",
                small_test_1_pass: 82,
                small_test_1_fail: 0,
                small_test_1_avg: 81.82,
                small_test_1_dept: "anat",
                small_test_1_section: "overall",
            },
            {
                small_test_1_title: "gross anat limbs",
                small_test_1_uuid: "12690",
                small_test_1_instructor: "alimohammadi, majid",
                small_test_1_audit: 0,
                small_test_1_year: "2014",
                small_test_1_id: "392",
                small_test_1_pass: 83,
                small_test_1_fail: 0,
                small_test_1_avg: 83.65,
                small_test_1_dept: "anat",
                small_test_1_section: "001",
            },
        ];
        const actual: object[] = await parser.parse_data();
        expect(actual).to.deep.equal(expected);
    });

});
