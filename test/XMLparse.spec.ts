import XMLParse from "../src/controller/consumer/parse_xml";
import * as fs from "fs";
import { promisify, inspect, isArray } from "util";
import { JSZipObject } from "../node_modules/@types/jszip";
import { expect } from "chai";
import * as path from "path";
import * as parse5 from "parse5";
import Log from "../src/Util";

describe("XMLPARSE", () => {
    let parser: XMLParse;

    before("load data", async () => {
        // LOAD DATA
        const id: string = "rooms";
        const filepath: string = path.join(__dirname + "/data/rooms.zip");
        const buffer: Buffer = await (promisify)(fs.readFile)(filepath);
        const content: string = buffer.toString("base64");
        parser = new XMLParse(id, content);
    });

    it("Should get index file xml", async () => {
        const filename: string = "index.xml";
        const index: JSZipObject = await parser.getIndex();
        expect(index.name).to.equal("sdmm/index.xml");
    });

    it("Should return true with a valid XML document", async () => {
        const index: JSZipObject = await parser.getIndex();
        const xml: string = await index.async("text");
        const buildings: any = parser.parse(xml);
        Log.test(inspect(buildings));
    });

    it("Should return false if given invalid XML document", () => {
        // TODO
    });

});
