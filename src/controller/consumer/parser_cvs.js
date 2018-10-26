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
const readline = require("readline");
const Parser_1 = require("./Parser");
class CVSParser extends Parser_1.default {
    constructor(id, content) {
        super(id, content);
        this.mKeys = ["pass", "fail", "audit", "avg", "course", "year"];
        this.translate = {
            subject: "dept",
            professor: "instructor",
            id: "uuid",
            course: "id",
        };
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            let folder;
            try {
                folder = yield this.getFolder();
            }
            catch (err) {
                throw new Error("unable to find folder");
            }
            folder.forEach((relativePath, f) => __awaiter(this, void 0, void 0, function* () {
                const cvsContents = this.cvsPromise(f);
                data.push(cvsContents);
            }));
            return Promise.all(data).then((d) => {
                const flatten = [].concat.apply([], d);
                return Promise.resolve(flatten);
            }).catch((err) => {
                return Promise.reject(Error("an error occurred"));
            });
        });
    }
    getFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            let jszip;
            try {
                jszip = yield this.jszip.loadAsync(this.content, { base64: true });
            }
            catch (err) {
                throw new Error("unable to get file");
            }
            return Promise.resolve(jszip);
        });
    }
    cvsPromise(f) {
        return __awaiter(this, void 0, void 0, function* () {
            let first = true;
            let keys;
            let stream;
            const json = new Array();
            try {
                stream = yield this.getReadableStream(f);
            }
            catch (err) {
                throw new Error("error occured with stream");
            }
            const rl = readline.createInterface({
                input: stream,
            });
            rl.on("line", (line) => {
                if (first) {
                    keys = line.split("|");
                    keys = keys.map((val, index) => val.toLowerCase());
                    keys = keys.map((val, index) => Object.keys(this.translate).includes(val) ? this.translate[val] : val);
                    first = !first;
                }
                else {
                    const lineObj = {};
                    const entry = line.split("|");
                    for (let i = 0; i < entry.length; i++) {
                        const key = keys[i];
                        const datum = this.mKeys.includes(key) ? parseFloat(entry[i]) : entry[i];
                        lineObj[`${this.id}_${key}`] = datum;
                    }
                    if (lineObj[`${this.id}_section`] === "overall") {
                        lineObj[`${this.id}_year`] = 1900;
                    }
                    json.push(lineObj);
                }
            });
            return new Promise((resolve, reject) => {
                rl.on("close", () => {
                    resolve(json);
                });
            });
        });
    }
    getReadableStream(f) {
        return __awaiter(this, void 0, void 0, function* () {
            let stream;
            try {
                stream = yield f.nodeStream();
            }
            catch (err) {
                throw new Error("unable to create stream");
            }
            return Promise.resolve(stream);
        });
    }
}
exports.default = CVSParser;
//# sourceMappingURL=parser_cvs.js.map