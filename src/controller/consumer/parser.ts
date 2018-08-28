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
import { validate } from "jsonschema";

export default class Parser {

    private allKeys: string[] = ["dept", "id", "instructor", "title", "pass", "fail", "audit", "uuid", "avg"];
    private mKeys: string[] = ["pass", "fail", "audit", "avg", "course"];
    private id: string;
    private filename: string;
    private jszip: JSzip;

    constructor(id: string, filename: string) {
        this.id = id;
        this.filename = filename;
        this.jszip = new JSzip();
    }

    // Parse the file
    // Return promise with JSON Object that represents all entries from all csv files in the folder
    public async parse_data(): Promise<object[]> {
        const data: Array<Promise<Array<{}>>> = [];
        const folder = await this.getFolder();
        folder.forEach( async (relativePath, f) => {
            const cvsContents = this.cvsPromise(f);
            data.push(cvsContents);
        });
        // this is just here to make TS Lint happy for now
        return Promise.all(data).then( (d) => {
            const flatten: Array<{}> = [].concat.apply([], d);
            return Promise.resolve(flatten);
        });
    }

    // Stores data in json file with same name of folder, ex: folder = "test", saves as test.json
    public store_data(data: {}): Promise<string> {
        // TODO store data in json file w same name
        const stringified: string = JSON.stringify(data);
        return new Promise<string>( (resolve, reject) => {
            fs.writeFile(`./src/cache/${this.id}.json`, stringified, (err) => {
                if (err) {
                    reject("there was an error");
                } else {
                    resolve("worked");
                }
            });
        });
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

    /**
     *
     * @param f (JSzip.JSZipObject): represetns 1 indiviudal csv file in the root folder
     * @returns Promise
     * converts each line of the csv file into an object
     * returns an array of these objects
     * when readline reaches the end of the file the value should be returned
     */
    private async cvsPromise(f: JSzip.JSZipObject): Promise<Array<{}>> {
        let first: boolean = true;
        let keys: string[];
        const json: Array<{}> = new Array<{}>();
        const stream = await this.getReadableStream(f);
        const rl = readline.createInterface({
            input: stream,
        });
        rl.on("line", (line) => {
            if (first) {
                keys = line.split("|");
                keys = keys.map( (val, index) => val.toLowerCase());
                first = !first;
            } else {
                const lineObj: any = {};
                const entry: string[] = line.split("|");
                for (let i: number = 0; i < entry.length; i++) {
                    const key: string = keys[i];
                    const datum: string | number = this.mKeys.includes(key) ? parseFloat(entry[i]) : entry[i];
                    lineObj[`${this.id}_${key}`] = datum;
                }
                json.push(lineObj);
            }
        });
        return new Promise<Array<{}>>( (resolve, reject) => {
            rl.on("close", () => {
                resolve(json);
            });
        });
    }
    /**
     *
     * @param f JSzip.JSZipObject
     * @returns NodeJS.Readable stream
     * allows readline to read each line of readable stream
     */
    private async getReadableStream(f: JSzip.JSZipObject): Promise<NodeJS.ReadableStream> {
        let stream: NodeJS.ReadableStream;
        try {
            stream = await f.nodeStream();
        } catch (err) {
            throw new Error("unable to create stream");
        }
        return Promise.resolve(stream);
    }
}
