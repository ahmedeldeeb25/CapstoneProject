/**
 * Parse the contents of each CSV file
 * Generate a data structure
 * Cache data structure
 */
import * as JSzip from "jszip";
import * as readline from "readline";
import Parser from "./Parser";

export default class CVSParser extends Parser {

    private mKeys: string[] = ["pass", "fail", "audit", "avg", "course", "year"];
    private translate: { [index: string]: string } = {
        subject: "dept",
        professor: "instructor",
        id: "uuid",
        course: "id",
    };

    constructor(id: string, content: string) {
        super(id, content);
    }

    // Parse the file
    // Return promise with JSON Object that represents all entries from all csv files in the folder
    public async parse(): Promise<object[]> {
        const data: Array<Promise<Array<{}>>> = [];
        let folder: JSzip;
        try {
            folder = await this.getFolder();
        } catch (err) {
            throw new Error("unable to find folder");
        }
        folder.forEach(async (relativePath, f) => {
            const cvsContents = this.cvsPromise(f);
            data.push(cvsContents);
        });
        return Promise.all(data).then((d) => {
            const flatten: Array<{}> = [].concat.apply([], d);
            return Promise.resolve(flatten);
        }).catch((err) => {
            return Promise.reject(Error("an error occurred"));
        });
    }

    // Returns array of the CSV files in the main folder
    private async getFolder(): Promise<JSzip> {
        let jszip: JSzip;
        try {
            jszip = await this.jszip.loadAsync(this.content, { base64: true });
        } catch (err) {
            throw new Error("unable to get file");
        }
        return Promise.resolve(jszip);
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
        let stream: NodeJS.ReadableStream;
        const json: Array<{}> = new Array<{}>();
        try {
            stream = await this.getReadableStream(f);
        } catch (err) {
            throw new Error("error occured with stream");
        }
        const rl = readline.createInterface({
            input: stream,
        });
        rl.on("line", (line) => {
            if (first) {
                keys = line.split("|");
                keys = keys.map((val, index) => val.toLowerCase());
                // make sure keys are uniform, i.e, subject should be department
                keys = keys.map((val, index) => Object.keys(this.translate).includes(val) ? this.translate[val] : val);
                first = !first;
            } else {
                const lineObj: any = {};
                const entry: string[] = line.split("|");
                for (let i: number = 0; i < entry.length; i++) {
                    const key: string = keys[i];
                    const datum: string | number = this.mKeys.includes(key) ? parseFloat(entry[i]) : entry[i];
                    lineObj[`${this.id}_${key}`] = datum;
                }
                if (lineObj[`${this.id}_section`] === "overall") {
                    lineObj[`${this.id}_year`] = 1900;
                }
                json.push(lineObj);
            }
        });
        return new Promise<Array<{}>>((resolve, reject) => {
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
