/*
 * Consumes a zipped file containing multiple CSV documents
 * Returns an error if the file is not a .zip
 * Returns an error if the .zip does not contain csv
 * Returns an error if the csv's are not in proper format
 *
 */
import * as JSzip from "jszip";
import * as fs from "fs";
import Log from "../../Util";
import { promisify } from "util";

export default class Validator {
    private filename: string;
    private foldername: string;

    constructor(filename: string, foldername: string) {
        this.filename = filename;
        this.foldername = foldername;
    }

    // Returns true if the file is valid, false if not;
    public async valid_file(): Promise<boolean> {
        Log.test("zip: " + this.valid_zip_file(this.filename) + " csv: " + await this.contains_only_csv());
        return this.valid_zip_file(this.filename) && await this.contains_only_csv();
    }

    // return false if the file doesn't end in .zip
    private valid_zip_file(filename: string): boolean {
        return /\.zip$/.test(filename);
    }

    // return false if the file doens't end in .csv
    private valid_csv_file(filename: string): boolean {
        return /\.csv$/.test(filename);
    }
    // Read the list of file names in a zipped file and if there is one that is not csv return false
    private async contains_only_csv(): Promise<boolean> {
        let value: boolean = true;
        try {
            const file: Buffer = await promisify(fs.readFile)(this.filename);
            const jszip: JSzip = await JSzip.loadAsync(file);
            const folder: JSzip.JSZipObject[] = jszip.folder(new RegExp("^" + this.foldername));
            // if there's no root folder in the zip file return false
            if (folder.length === 0) {
                return false;
            } else {
                // if any files in the zip file contain a non csv file return false
                await jszip.folder(this.foldername).forEach( (relativePath, f) => {
                    if (!this.valid_csv_file(relativePath)) {
                        value = false;
                    }
                });
            }
        } catch (err) {
            return false;
        }
        return value;
    }

}
