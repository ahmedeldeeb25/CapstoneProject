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
        const index: boolean = await parser.setIndex();
        expect(index).to.equal(true);
        expect(parser.getIndex().name).to.equal("sdmm/index.xml");
    });

    it("Should return true with a valid XML document", async () => {
        const valid: boolean = await parser.setIndex();
        const index: JSZipObject = parser.getIndex();
        const xml: string = await index.async("text");
        const buildings: any = await parser.parse(xml);
        expect(valid).to.equal(true);
        expect(buildings.length).to.equal(62);
    });

    it("Should return false if given invalid XML document", async () => {
        const id: string = "nonsense";
        const filepath: string = path.join(__dirname + "/data/nonsense.zip");
        const buffer: Buffer = await(promisify)(fs.readFile)(filepath);
        const content: string = buffer.toString("base64");
        const p: XMLParse = new XMLParse(id, content);
        let response: boolean;
        try {
            response = await p.setIndex();
        } catch (err) {
            Log.test("Error: " + err);
            response = err;
        }
        expect(response).to.equal(false);
    });

    it("Should parse room from path in index.xml no rooms", async () => {
        const file: string = "./campus/discover/buildings-and-classrooms/SOJ";
        const output: {} = {};
        let room: {};
        try {
            room = await parser.parseRooms(file);
        } catch (err) {
            Log.test("Error: " + err);
            room = err;
        }
        expect(room).to.deep.equal([]);
    });

    it("Should parse room from path in index.xml lots of rooms", async () => {
        const file: string = "./campus/discover/buildings-and-classrooms/ANGU";
        const output: {} = {};
        let room: {};
        try {
            room = await parser.parseRooms(file);
        } catch (err) {
            Log.test("ERROR: " + err);
            room = err;
        }
        // Log.test(JSON.stringify(room));
        // expect(room).to.deep.equal([]);
    });

    it("Should have lat and long in data", async () => {
        const valid: boolean = await parser.setIndex();
        const index: JSZipObject = parser.getIndex();
        const xml: string = await index.async("text");
        const buildings: any = await parser.parse(xml);
        Log.test(JSON.stringify(buildings));
        expect(buildings[0].lat).to.not.equal(null || undefined);
        expect(buildings[1].lon).to.not.equal(null || undefined);
        Log.test(JSON.stringify(buildings[3]));
    });
});
