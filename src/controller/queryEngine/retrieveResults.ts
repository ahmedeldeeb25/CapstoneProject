import { IsplitQuery } from "../queryAST/splitQuery";
import * as fs from "fs";
import QueryFilter from "../queryAST/queryFilter";
import { isArray, isString } from "util";

export default class QueryEngine {
    private data: object[];
    private id: string;
    private keysMap: { [name: string]: string } = {
        Department: "dept",
        ID: "id",
        Average: "avg",
        Instructor: "instructor",
        Title: "title",
        Pass: "pass",
        Fail: "fail",
        Audit: "audit",
        UUID: "uuid",
        Section: "section",
        Year: "year",
        Course: "course",
        Subject: "subject",
        Professor: "instructor",
    };

    constructor(id: string) {
        this.id = id;
    }

    public get_data(): object[] { return this.data; }
    public data_setter(data: object[]) { this.data = data; }

    // use FS to get contents of the json file of id
    public async set_data(): Promise<string> {
        return new Promise<string>( (resolve, reject) => {
            fs.readFile("./src/cache/" + this.id + ".json", "utf8", (err, data) => {
                if (err) {
                    reject("failed");
                }
                this.data = JSON.parse(data);
                resolve("worked");
            });
        });
    }

    // returns an array of objects matching the query using the data
    public query_data(query: IsplitQuery): object[] {
        // get what we need to show (<id>_<key> as represented in JSON)
        const show: string[] = this.get_show(query.show);
        // O(n) * 2 == O(n) ?, but would be faster if i didnt have to iterate over twice
        // filter data by filter
        let data: object[] = this.filter_data(query.filter);
        // sort if sort is true
        if (query.order) {
            const orderOn: string = query.order.getKey();
            data = this.sort_data(data, orderOn);
        }
        // map so that it only shows what we want (i'm sure there's a nice ES6 way to do this)
        data = data.map( (x: { [index: string]: string | number }) => {
            const y: { [index: string]: string | number } = {};
            for (const s of show) {
                y[s] = x[s];
            }
            return y;
        });
        return data;
    }

    /**
     *
     * @param query list of keys ["Department", "Average", "Audit"]
     * @returns list of id_keys ["courses_dept","courses_avg", "courses_audit"];
     */
    private get_show(query: string[]): string[] {
        return query.map( (s) => this.id_key(s));
    }

    /**
     *
     * @param key: String = "Deparment" | "Audit" | "Pass" | "Fail"... etc
     * @returns string = "id_dept" | "id_audit" | "id_pass" ... etc
     */
    private id_key(key: string) {
        return this.id + "_" + this.keysMap[key];
    }

    /**
     *
     * @param filter Takes a list of filters or just 1 filter if it's a "find all entries"
     * @returns object[] of filtered data by each filter
     */
    private filter_data(filter: QueryFilter | QueryFilter[]): object[] {
        const data: object[] = this.data;
        // if it's not an array then it must be a find all entries type
        if (!isArray(filter)) {
            return data;
        } else {
            // loop over all the filters and see if that instance matches all the criteria
            return data.filter( (x: { [index: string]: string | number }) => {
                let result: boolean;
                for (const f of filter) {
                    const key: string = this.id_key(f.criteria.getKey());
                    let target: string | number = f.criteria.getTarget();
                    // remove the extra pair of quotes surrounding target if it's a string
                    if (isString(target)) {
                        target = target.slice(1, -1);
                    }
                    const fun = f.criteria.getFunc();
                    if (f.andOr === "and") {
                        result = result && fun(x[key], target);
                    } else if (f.andOr === "or" ) {
                        result = result || fun(x[key], target);
                    } else {
                        result = fun(x[key], target);
                    }
                }
                return result;
            });
        }
    }

    // sort the data
    private sort_data(data: object[], orderOn: string): object[] {
        orderOn = this.id_key(orderOn);
        data = data.sort(((a: { [i: string]: number | string }, b: { [i: string]: number | string }) => {
            if (a[orderOn] < b[orderOn]) {
                return -1;
            }
            if (a[orderOn] > b[orderOn]) {
                return 1;
            }
            return 0;
        }));
        return data;
    }

}
