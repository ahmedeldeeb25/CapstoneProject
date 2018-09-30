/*
 * Consumes a zipped file containing multiple CSV documents
 * Returns an error if the file is not a .zip
 * Returns an error if the .zip does not contain csv
 * Returns an error if the csv's are not in proper format
 *
 */
import * as JSzip from "jszip";
import * as fs from "fs";
import * as path from "path";

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
        let jszip: JSzip = new JSzip();
        let folder: string;
        try {
            jszip = await jszip.loadAsync(this.content, { base64: true});
            // go through all the files and get the name of the one that is a directory
            // super slow, but the only way to do it without the name of the folder given?
            for (const [name, jszipobj] of Object.entries(jszip.files)) {
                if (jszipobj.dir) {
                    folder = name;
                    break;
                }
            }
            // if the folder exists, make sure all files in the folder are csv files
            // if not throw an error
            if (folder) {
                    jszip.folder(folder).forEach( (relativePath, f) => {
                    if (!this.valid_csv_file(f.name)) {
                        throw new Error("File was not a csv");
                    }
                });
            } else {
                throw new Error("No folder found!");
            }
        } catch (err) {
            return false;
        }
        return true;
    }

    // returns false if there's already a file in the cache
    // with the name ${foldername}.json
    private data_doesnt_exist(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path.join(__dirname, "..", "..", `${this.id}.json`), (exists) => {
                resolve(!exists);
            });
        });
    }
}
