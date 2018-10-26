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
const Util_1 = require("../Util");
const IInsightFacade_1 = require("./IInsightFacade");
const validator_1 = require("./consumer/validator");
const parser_cvs_1 = require("./consumer/parser_cvs");
const util_1 = require("util");
const splitQuery_1 = require("./queryAST/splitQuery");
const validateQuery_1 = require("./queryAST/validateQuery");
const retrieveResults_1 = require("./queryEngine/retrieveResults");
const fs = require("fs");
const parser_xml_1 = require("./consumer/parser_xml");
const splitGroupedQuery_1 = require("./queryAST/splitGroupedQuery");
class InsightFacade {
    constructor() {
        this.dataSets = [];
        this.cache = {};
        Util_1.default.trace("InsightFacadeImpl::init()");
    }
    get_cache() {
        return this.cache;
    }
    set_cache(cache) {
        this.cache = cache;
    }
    addDataset(id, content, kind) {
        return __awaiter(this, void 0, void 0, function* () {
            const validator = new validator_1.default(id, content);
            let parser;
            let validFile;
            let data;
            if (kind !== IInsightFacade_1.InsightDatasetKind.Courses && kind !== IInsightFacade_1.InsightDatasetKind.Rooms) {
                return Promise.reject({ code: 400, body: { error: "not valid kind" } });
            }
            try {
                parser = kind === IInsightFacade_1.InsightDatasetKind.Rooms ? new parser_xml_1.default(id, content) : new parser_cvs_1.default(id, content);
                validFile = kind === IInsightFacade_1.InsightDatasetKind.Courses ? yield validator.valid_file() : true;
                if (!validFile || this.cache[id]) {
                    return Promise.reject({ code: 400, body: { error: "file was not valid" } });
                }
                else if (yield (util_1.promisify)(fs.exists)(`./${id}.json`)) {
                    data = JSON.parse(yield (util_1.promisify)(fs.readFile)(`./${id}.json`, "utf-8"));
                    this.cache[id] = data;
                }
                else {
                    if (kind === IInsightFacade_1.InsightDatasetKind.Courses) {
                        data = yield parser.parse();
                    }
                    else {
                        data = JSON.parse(yield (util_1.promisify)(fs.readFile)("./src/rooms.json", "utf-8"));
                    }
                    this.cache[id] = data;
                    yield (util_1.promisify)(fs.writeFile)(`./${id}.json`, JSON.stringify(data));
                }
            }
            catch (err) {
                Util_1.default.test("ERROR: " + err);
                return Promise.reject({ code: 400, body: { error: err } });
            }
            this.dataSets.push({ id, kind, numRows: data.length });
            return Promise.resolve({ code: 204, body: { result: "success" } });
        });
    }
    removeDataset(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (id === "" || util_1.isNull(id)) {
                    return Promise.reject({ code: 404, body: { error: "invalid parameter" } });
                }
                if (this.cache[id]) {
                    delete this.cache[id];
                    yield (util_1.promisify)(fs.unlink)(`./${id}.json`);
                    return Promise.resolve({ code: 204, body: null });
                }
                else {
                    return Promise.reject({ code: 404, body: { error: "dataset doesn't exist" } });
                }
            }
            catch (err) {
                return Promise.reject({ code: 404, body: { error: "something went wrong!" } });
            }
        });
    }
    performQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryAST;
            let validator;
            try {
                if (query.includes("grouped by")) {
                    queryAST = new splitGroupedQuery_1.default(query);
                }
                else {
                    queryAST = new splitQuery_1.SplitQuery(query);
                }
                validator = new validateQuery_1.default(queryAST);
            }
            catch (err) {
                return Promise.reject({ code: 400, body: { error: "invalid query" } });
            }
            const dataset = queryAST.get_input();
            if (validator.valid_query(query)) {
                const queryEngine = new retrieveResults_1.default(dataset);
                let result;
                try {
                    let data;
                    if (this.cache[dataset]) {
                        data = this.cache[dataset].slice();
                    }
                    else if (yield (util_1.promisify)(fs.exists)(`./${dataset}.json`)) {
                        data = JSON.parse(yield (util_1.promisify)(fs.readFile)(`./${dataset}.json`, "utf-8"));
                        this.cache[dataset] = data;
                    }
                    else {
                        throw Error("data not found");
                    }
                    queryEngine.data_setter(data);
                    result = queryEngine.query_data(queryAST.get_split_query());
                }
                catch (err) {
                    Util_1.default.test("err: the data wasn't valid" + err);
                    return Promise.reject({ code: 400, body: { error: "dataset not found" } });
                }
                return Promise.resolve({ code: 200, body: { result } });
            }
            else {
                return Promise.reject({ code: 400, body: { error: "invalid query" } });
            }
        });
    }
    listDatasets() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve({ code: 200, body: { result: this.dataSets } });
        });
    }
}
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map