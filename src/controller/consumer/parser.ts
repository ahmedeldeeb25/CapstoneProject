/**
 * Parse the contents of each CSV file
 * Generate a data structure
 * Cache data structure
 */
import * as JSzip from "jszip";
import * as fs from "fs";
import Log from "../../Util";

export default class Parser {

    private keys: string[] = ["dept", "id", "instructor", "title", "pass", "fail", "audit", "uuid", "avg"];
    private id: string;
    private folder: JSzip;

    constructor(id: string, folder: JSzip) {
        this.id = id;
        this.folder = folder;
    }

    // Parse the file
    public parse_data(): object[] {
        return [{}];
    }

    // Stores data in json file with same name of folder, ex: folder = "test", saves as test.json
    public store_data(): void {
        // TODO store data in json file w same name
    }

}
