import XMLParse from "../src/controller/consumer/parse_xml";
import * as fs from "fs";
import { promisify, inspect } from "util";
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
        const doc: { [childNodes: string]: any } = parse5.parse(xml);
        let buildings: any = doc["childNodes"][1]["childNodes"][1]["childNodes"][0]["childNodes"];
        const data: object[] = [];
        Log.test(inspect(buildings));
        buildings = buildings.filter( (x: any) => x["nodeName"] === "building" );
        for (const building of buildings) {
            Log.test("BUILDING");
            const makeBuild: any = {};
            for (const attr of buildings["attrs"]) {
                makeBuild[attr["name"]] = attr["value"];
            }
            const location: any = building["childNodes"].filter( (x: any) => x["nodeName"] === "location");
            for (const attr of location["attrs"]) {
                makeBuild[attr["name"]] = attr["value"];
            }
            Log.test(JSON.stringify(makeBuild));
            data.push(makeBuild);
        }
        Log.test(JSON.stringify(data));
    });

    it("Should return false if given invalid XML document", () => {
        // TODO
    });

});
