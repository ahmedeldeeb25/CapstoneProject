import { expect, assert } from "chai";
import Validator from "../src/controller/consumer/validator";
import Parser from "../src/controller/consumer/parser";
import Log from "../src/Util";
import * as JSzip from "jszip";
import * as fs from "fs";
import { AssertionError } from "assert";

describe("Consumer valid_file validator", () => {
    let validator: Validator;

    it("Should return false if the file is not a zip", async () => {
        const filename: string = "./test/data/testfile.jpg";
        const foldername: string = "testfile";
        validator = new Validator(filename, foldername);
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
        const filename: string = "./test/data/nonsense.zip";
        const foldername: string = "nonsense";
        validator = new Validator(filename, foldername);
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
        const filename: string = "./test/data/courses.zip";
        const foldername: string = "courses";
        validator = new Validator(filename, foldername);
        let value: boolean;
        try {
            value = await validator.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(true);
        }
    });

    it("Should return a valid JSZip if given folder name", () => {
        const filename: string = "./test/data/courses.zip";
        const foldername: string = "courses";
        let jszip: JSzip;
        validator = new Validator(filename, foldername);
        jszip = validator.get_folder();
        expect(jszip).to.be.an.instanceof(JSzip);
    });

});

describe("Consumer Parser", () => {

    let parser: Parser;
    let folder: JSzip;
    before("Before each", () => {
        // assumes that file is valid
        const validator: Validator = new Validator("./test/data/small_test.zip", "small_test");
        folder = validator.get_folder();
        parser = new Parser("courses", folder);
    });

    after("After each", () => {
        // TODO: delete file made for cache
    });

    it("Should parse each line of a file and convert it into an object", () => {
        const expected: object[] = [
            {
                 small_test_title: "gross anat limbs",
                 small_test_id: "1845",
                 small_test_professor: "alimohammadi, majid",
                 small_test_audit: 0,
                 small_test_year: 2013,
                 small_test_course: 392,
                 small_test_pass: 82,
                 small_test_fail: 0,
                 small_test_avg: 81.82,
                 small_test_subject: "anat",
                 small_test_section: "001",
            },
            {
                small_test_title: "gross anat limbs",
                small_test_id: "1846",
                small_test_professor: "",
                small_test_audit: 0,
                small_test_year: 2013,
                small_test_class: 392,
                small_test_pass: 82,
                small_test_fail: 0,
                small_test_avg: 81.82,
                small_test_subject: "anat",
                small_test_section: "overall",
            },
            {
                small_test_title: "gross anat limbs",
                small_test_id: "12690",
                small_test_professor: "alimohammadi, majid",
                small_test_audit: 0,
                small_test_year: 2014,
                small_test_course: 392,
                small_test_pass: 83,
                small_test_fail: 0,
                small_test_avg: 83.65,
                small_test_subject: "anat",
                small_test_section: "001",
            },
        ];
        const actual: object[] = parser.parse_data();
        expect(actual).to.deep.equal(expected);
    });

    it("Should store the objects in a cache", async () => {
        await parser.store_data();
        const folderName: string = folder.name;
        expect(fs.existsSync("../src/cache/" + folderName + ".json")).to.equal(true);
    });

});
