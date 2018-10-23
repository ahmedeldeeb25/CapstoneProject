import Log from "../Util";
import { IInsightFacade, InsightResponse, InsightDatasetKind, InsightDataset } from "./IInsightFacade";
import Validator from "./consumer/validator";
import CVSParser from "./consumer/parser_cvs";
import { isNull, promisify } from "util";
import { SplitQuery } from "./queryAST/splitQuery";
import ValidateQuery from "./queryAST/validateQuery";
import QueryEngine from "./queryEngine/retrieveResults";
import * as fs from "fs";
import XMLParse from "./consumer/parser_xml";
import IParser from "./consumer/Parser";
import SplitGroupQuery from "./queryAST/splitGroupedQuery";

/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
    private dataSets: InsightDataset[] = [];
    private cache: { [name: string]: object[] } = {};
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public get_cache(): { [name: string]: object[] } {
        return this.cache;
    }

    public set_cache(cache: { [name: string]: object[] }): void {
        this.cache = cache;
    }

    public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
        const validator = new Validator(id, content);
        let parser: IParser;
        let validFile: boolean;
        let data: object[];
        // typescript should prevent this
        if (kind !== InsightDatasetKind.Courses && kind !== InsightDatasetKind.Rooms) {
            return Promise.reject({ code: 400, body: { error: "not valid kind" } });
        }
        try {
            // Set type of parser based on the kind passed in
            parser = kind === InsightDatasetKind.Rooms ? new XMLParse(id, content) : new CVSParser(id, content);
            // invalid rooms data will throw an error while parsing
            validFile = kind === InsightDatasetKind.Courses ? await validator.valid_file() : true;
            // if file valid AND is the data not already there?
            if (!validFile || this.cache[id]) {
                return Promise.reject({ code: 400, body: { error: "file was not valid" } });
                // if the data is already there just load it into RAM
            } else if (await (promisify)(fs.exists)(`./${id}.json`)) {
                data = JSON.parse(await (promisify)(fs.readFile)(`./${id}.json`, "utf-8"));
                this.cache[id] = data;
            } else {
                // file is valid and data is not there so parse, save it to RAM and hard disk
                if (kind === InsightDatasetKind.Courses) {
                    data = await parser.parse();
                } else {
                    data = JSON.parse(await (promisify)(fs.readFile)("./src/rooms.json", "utf-8"));
                    // data = await parser.parse();
                }
                this.cache[id] = data;
                await (promisify)(fs.writeFile)(`./${id}.json`, JSON.stringify(data));
            }
        } catch (err) {
            Log.test("ERROR: " + err);
            return Promise.reject({ code: 400, body: { error: err } });
        }
        this.dataSets.push({ id, kind, numRows: data.length });
        return Promise.resolve({ code: 204, body: { result: "success" } });
    }

    public async removeDataset(id: string): Promise<InsightResponse> {
        try {
            if (id === "" || isNull(id)) {
                return Promise.reject({ code: 404, body: { error: "invalid parameter" } });
            }
            if (this.cache[id]) {
                delete this.cache[id];
                await (promisify)(fs.unlink)(`./${id}.json`);
                return Promise.resolve({ code: 204, body: null });
            } else {
                return Promise.reject({ code: 404, body: { error: "dataset doesn't exist" } });
            }
        } catch (err) {
            return Promise.reject({ code: 404, body: { error: "something went wrong!" } });
        }
    }

    public async performQuery(query: string): Promise<InsightResponse> {
        let queryAST: SplitQuery;
        let validator: ValidateQuery;
        // Try and split the query into a AST, if it throws an error than it was inherently a bad query
        try {
            if (query.includes("grouped by")) {
                queryAST = new SplitGroupQuery(query);
            } else {
                queryAST = new SplitQuery(query);
            }
            validator = new ValidateQuery(queryAST);
        } catch (err) {
            return Promise.reject({ code: 400, body: { error: "invalid query" } });
        }
        const dataset: string = queryAST.get_input();
        // Check to see if the query was valid
        if (validator.valid_query(query)) {
            const queryEngine: QueryEngine = new QueryEngine(dataset);
            let result: object[];
            // Store the cached data in the queryEngine object then use the queryAST to get the data
            try {
                // await queryEngine.set_data();
                // don't mess up the data that's cached!
                let data: object[];
                if (this.cache[dataset]) {
                    data = this.cache[dataset].slice();
                } else if (await (promisify)(fs.exists)(`./${dataset}.json`)) {
                    data = JSON.parse(await (promisify)(fs.readFile)(`./${dataset}.json`, "utf-8"));
                    this.cache[dataset] = data;
                } else {
                    throw Error("data not found");
                }
                queryEngine.data_setter(data);
                result = queryEngine.query_data(queryAST.get_split_query());
            } catch (err) {
                Log.test("err: the data wasn't valid" + err);
                return Promise.reject({ code: 400, body: { error: "dataset not found" } });
            }
            return Promise.resolve({ code: 200, body: { result } });
        } else {
            return Promise.reject({ code: 400, body: { error: "invalid query" } });
        }
    }

    public async listDatasets(): Promise<InsightResponse> {
        return Promise.resolve({ code: 200, body: { result: this.dataSets } });
    }
}
