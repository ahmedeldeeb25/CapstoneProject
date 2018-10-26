"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const JSzip = require("jszip");
const fs = require("fs");
const path = require("path");
class Validator {
    constructor(id, content) {
        this.id = id;
        this.content = content;
    }
    valid_file() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.contains_only_csv()) && (yield this.data_doesnt_exist());
        });
    }
    valid_csv_file(filename) {
        return /\.csv$/.test(filename);
    }
    contains_only_csv() {
        return __awaiter(this, void 0, void 0, function* () {
            let jszip = new JSzip();
            let folder;
            try {
                jszip = yield jszip.loadAsync(this.content, { base64: true });
                for (const [name, jszipobj] of Object.entries(jszip.files)) {
                    if (jszipobj.dir) {
                        folder = name;
                        break;
                    }
                }
                if (folder) {
                    jszip.folder(folder).forEach((relativePath, f) => {
                        if (!this.valid_csv_file(f.name)) {
                            throw new Error("File was not a csv");
                        }
                    });
                }
                else {
                    throw new Error("No folder found!");
                }
            }
            catch (err) {
                return false;
            }
            return true;
        });
    }
    data_doesnt_exist() {
        return new Promise((resolve, reject) => {
            fs.exists(path.join(__dirname, "..", "..", `${this.id}.json`), (exists) => {
                resolve(!exists);
            });
        });
    }
}
exports.default = Validator;
//# sourceMappingURL=validator.js.map