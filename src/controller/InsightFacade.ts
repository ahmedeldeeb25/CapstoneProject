import Log from "../Util";
import {IInsightFacade, InsightResponse, InsightDatasetKind } from "./IInsightFacade";
import Validator from "./consumer/validator";
import Parser from "./consumer/parser";

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

    public removeDataset(id: string): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }

    public performQuery(query: string): Promise <InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }

    public listDatasets(): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }
}
