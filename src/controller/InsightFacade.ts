import Log from "../Util";
import { IInsightFacade, InsightResponse, InsightDatasetKind, InsightDataset } from "./IInsightFacade";
import Validator from "./consumer/validator";
import Parser from "./consumer/parser";
import { isNull, promisify } from "util";
import { SplitQuery } from "./queryAST/splitQuery";
import ValidateQuery from "./queryAST/validateQuery";
import QueryEngine from "./queryEngine/retrieveResults";
import { PostCode } from "./test";

/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
    private dataSets: InsightDataset[] = [];
    private cache: { [name: string]: object[] } = {};
    private pc: PostCode = new PostCode();
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
                this.pc.postCode(id + " file was not valid");
                return Promise.reject({ code: 400, body: { error: "file was not valid" } });
            } else {
                data = await parser.parse_data();
                this.cache[id] = data;
            }
        } catch (err) {
            this.pc.postCode(id + "caused this error the error: " + err);
            return Promise.reject({ code: 400, body: { error: err } });
        }
        this.dataSets.push({ id, kind, numRows: data.length });
        return Promise.resolve({ code: 204, body: { result: "success" } });
    }

    public async removeDataset(id: string): Promise<InsightResponse> {
        try {
            if (id === "" || isNull(id)) {
                this.pc.postCode(": invalid parameter");
                return Promise.reject({ code: 404, body: { error: "invalid parameter" } });
            }
            if (this.cache[id]) {
                delete this.cache[id];
                return Promise.resolve({ code: 204, body: null });
            } else {
                this.pc.postCode(id + " the data doesn't exist");
                return Promise.reject({ code: 404, body: { error: "dataset doesn't exist" } });
            }
        } catch (err) {
            this.pc.postCode(id + " something went wrong!");
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
            this.pc.postCode(query +  ": query was not valid " + err);
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
                this.pc.postCode(query + ": data was not valid!");
                Log.test("err: the data wasn't valid" + err);

                return Promise.reject({ code: 400, body: { error: "dataset not found" } });
            }
            return Promise.resolve({ code: 200, body: { result } });
        } else {
            this.pc.postCode(query + ": invalid query!");
            return Promise.reject({ code: 400, body: { error: "invalid query" } });
        }
    }

    public async listDatasets(): Promise<InsightResponse> {
        return Promise.resolve({ code: 200, body: { result: this.dataSets } });
    }
}
