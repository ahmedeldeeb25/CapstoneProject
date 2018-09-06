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

export default class Validator {
    private id: string;
    private content: string;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
    }

    // Returns true if the file is valid, false if not;
    public async valid_file(): Promise<boolean> {
        return await this.contains_only_csv() && await this.data_doesnt_exist();
    }

    // return false if the file doens't end in .csv
    private valid_csv_file(filename: string): boolean {
        return /\.csv$/.test(filename);
    }
    // Read the list of file names in a zipped file and if there is one that is not csv return false
    private async contains_only_csv(): Promise<boolean> {
        try {
            const jszip: JSzip = await JSzip.loadAsync(this.content, { base64: true});
            const folder: JSzip.JSZipObject[] = jszip.folder(new RegExp("^" + this.id));
            // if there's no root folder in the zip file return false
            if (folder.length === 0) {
                throw Error("No folder found!");
            } else {
                // if any files in the zip file contain a non csv file return false
                await jszip.folder(this.id).forEach((relativePath, f) => {
                    if (!this.valid_csv_file(relativePath)) {
                        throw Error("File was not a csv");
                    }
                });
            }
        } catch (err) {
            Log.test("there was en error" + err);
            return false;
        }
        return true;
    }

    // returns false if there's already a file in the cache
    // with the name ${foldername}.json
    private data_doesnt_exist(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(`./src/cache/${this.id}.json`, (exists) => {
                resolve(!exists);
            });
        });
    }
}
