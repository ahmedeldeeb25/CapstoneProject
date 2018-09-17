import Log from "../Util";
import { IInsightFacade, InsightResponse, InsightDatasetKind, InsightDataset } from "./IInsightFacade";
import Validator from "./consumer/validator";
import Parser from "./consumer/parser";
import { isNull, promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { SplitQuery } from "./queryAST/splitQuery";
import ValidateQuery from "./queryAST/validateQuery";
import QueryEngine from "./queryEngine/retrieveResults";

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

    public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
        const validator = new Validator(id, content);
        const parser: Parser = new Parser(id, content);
        let validFile: boolean;
        let data: object[];
        try {
            validFile = await validator.valid_file();
            if (!validFile || this.cache[id]) {
                return Promise.reject({ code: 400, body: { error: "file was not valid" } });
            } else {
                data = await parser.parse_data();
                this.cache[id] = data;
                // await parser.store_data(data);
            }
        } catch (err) {
            Log.test("the error: " + err);
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
            queryAST = new SplitQuery(query);
            validator = new ValidateQuery(queryAST);
        } catch (err) {
            Log.test("err: query was not valid!" + err);
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
                queryEngine.data_setter(this.cache[dataset]);
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
