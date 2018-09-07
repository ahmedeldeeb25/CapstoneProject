import Log from "../Util";
import {IInsightFacade, InsightResponse, InsightDatasetKind } from "./IInsightFacade";
import Validator from "./consumer/validator";
import Parser from "./consumer/parser";
import { isNull, promisify } from "util";
import * as fs from "fs";
import { SplitQuery } from "./queryAST/splitQuery";
import ValidateQuery from "./queryAST/validateQuery";
import QueryEngine from "./queryEngine/retrieveResults";
/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
        const validator = new Validator(id, content);
        const parser: Parser = new Parser(id, content);
        let validFile: boolean;
        let data: object[];
        try {
            validFile = await validator.valid_file();
            if (!validFile) {
                return Promise.reject({ code: 400, body: { error: "file was not valid" } });
            } else {
                data = await parser.parse_data();
                await parser.store_data(data);
            }
        } catch (err) {
            return Promise.reject({ code: 400, body: { error: err }});
        }
        return Promise.resolve({ code: 204, body: { result: "success" } });
    }

    public async removeDataset(id: string): Promise<InsightResponse> {
        try {
            if (id === "" || isNull(id)) {
                return Promise.reject({ code: 404, body: { error: "invalid parameter" } });
            }
            if (await (promisify)(fs.exists)(`./src/cache/${id}.json`)) {
                await (promisify)(fs.unlink)(`./src/cache/${id}.json`);
                return Promise.resolve({ code: 204, body: null });
            } else {
                return Promise.reject({ code: 404, body: { error: "dataset doesn't exist" }});
            }
        } catch (err) {
            return Promise.reject({ code: 404, body: { error: "something went wrong!"}});
        }
    }

    public async performQuery(query: string): Promise <InsightResponse> {
        let queryAST: SplitQuery;
        let validator: ValidateQuery;
        // Try and split the query into a AST, if it throws an error than it was inherently a bad query
        try {
            queryAST = new SplitQuery(query);
            validator = new ValidateQuery(queryAST);
        } catch (err) {
            Log.test("err: query was not valid!" + err);
            return Promise.reject({ code: 400, body: { error: "invalid query" }});
        }
        const dataset: string = queryAST.get_input();
        // Check to see if the query was valid
        if (validator.valid_query(query)) {
            const queryEngine: QueryEngine = new QueryEngine(dataset);
            let result: object[];
            // Store the cached data in the queryEngine object then use the queryAST to get the data
            try {
                await queryEngine.set_data();
                result = queryEngine.query_data(queryAST.get_split_query());
            } catch (err) {
                Log.test("err: the data wasn't valid" + err);
                return Promise.reject({ code: 400, body: { error: "dataset not found" } });
            }
            return Promise.resolve({ code: 200, body: {result }});
        } else {
            return Promise.reject({ code: 400, body: { error: "invalid query" }});
        }
    }

    public listDatasets(): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }
}
