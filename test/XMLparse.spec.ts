import XMLParse from "../src/controller/consumer/parse_xml";
import * as fs from "fs";
import { promisify } from "util";
import { JSZipObject } from "../node_modules/@types/jszip";
import { expect } from "chai";
import * as path from "path";
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
        const rooms: any = await parser.parse(xml);
        expect(valid).to.equal(true);
        expect(rooms.length).to.equal(284);
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
        let rooms: any;
        try {
            const valid: boolean = await parser.setIndex();
            const index: JSZipObject = parser.getIndex();
            const xml: string = await index.async("text");
            rooms = await parser.parse(xml);
        } catch (err) {
            throw Error("ERROR: " + err);
        }
        expect(rooms[0]["rooms_lat"]).to.not.equal(null || undefined);
        expect(rooms[1]["rooms_lon"]).to.not.equal(null || undefined);
    });
});
