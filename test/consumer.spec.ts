import { expect } from "chai";
import Consumer from "../src/controller/consumer/consumer";
import Log from "../src/Util";

describe("valid_file consumer", () => {
    let consumer: Consumer;

    it("Should return false if the file is not a zip", async () => {
        const filename: string = "./test/data/testfile.jpg";
        const foldername: string = "testfile";
        consumer = new Consumer(filename, foldername);
        let value: boolean;
        try {
            value = await consumer.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(false);
        }
    });

    it("Should return false if the file does not contain csv", async () => {
        const filename: string = "./test/data/nonsense.zip";
        const foldername: string = "nonsense";
        consumer = new Consumer(filename, foldername);
        let value: boolean;
        try {
            value = await consumer.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(false);
        }
    });

    it("Should return true if the file is a valid zip file that contains csv", async () => {
        const filename: string = "./test/data/courses.zip";
        const foldername: string = "courses";
        consumer = new Consumer(filename, foldername);
        let value: boolean;
        try {
            value = await consumer.valid_file();
        } catch (err) {
            value = err;
        } finally {
            expect(value).to.equal(true);
        }
    });

});
