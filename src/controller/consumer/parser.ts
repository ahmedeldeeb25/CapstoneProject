/**
 * Parse the contents of each CSV file
 * Generate a data structure
 * Cache data structure
 */
import * as JSzip from "jszip";
import * as fs from "fs";
import * as readline from "readline";
import Log from "../../Util";
import { promisify } from "util";
import { resolve } from "dns";
import { relative } from "path";

export default class Parser {

    private keys: string[] = ["dept", "id", "instructor", "title", "pass", "fail", "audit", "uuid", "avg"];
    private id: string;
    private filename: string;
    private jszip: JSzip;

    constructor(id: string, filename: string) {
        this.id = id;
        this.filename = filename;
        this.jszip = new JSzip();
    }

    // Parse the file
    // Return promise with JSON Object
    public async parse_data(): Promise<{}> {
        const data: object[] = [];
        const folder = await this.getFolder();
        Log.test("Name of file: " + folder);
        folder.forEach( (relativePath, f) => {
            Log.test(f.name);
            // might have to wrap folder.forEach in a promise to make sure that i return the data at the end of parsing
            // let stream: NodeJS.ReadableStream;
            // try {
            //     stream = await f.nodeStream();
            // } catch (err) {
            //     throw new Error("unable to create stream");
            // }
            // const rl = readline.createInterface({
            //     input: stream,
            // });
            // rl.on("line", (line) => {
            //     Log.test(line);
            // });
        });
        // this is just here to make TS Lint happy for now
        return Promise.resolve({});
    }

    // Stores data in json file with same name of folder, ex: folder = "test", saves as test.json
    public store_data(): void {
        // TODO store data in json file w same name
    }

    // Returns array of the CSV files in the main folder
    private async getFolder(): Promise<JSzip> {
        let jszip: JSzip;
        let folder: JSzip;
        try {
            const file: Buffer = await promisify(fs.readFile)(this.filename);
            jszip = await this.jszip.loadAsync(file);
        } catch (err) {
            Log.test(err);
            throw new Error("unable to get file");
        } finally {
            folder = jszip.folder(this.id + "/");
        }
        return Promise.resolve(folder);
    }
}
