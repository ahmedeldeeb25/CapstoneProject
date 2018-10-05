import { IsplitQuery } from "../queryAST/splitQuery";
import QueryFilter from "../queryAST/queryFilter";
import { isArray, isString, isNull, isUndefined, inspect } from "util";
import Grouper from "./groupResults";
import AggregateResults from "./aggregateResults";

export default class QueryEngine {
    private data: object[];
    private id: string;
    private KEYS: string[] =
        ["Average", "Pass", "Fail",
            "Audit", "Department", "ID",
            "Instructor", "Title", "UUID",
            "Seats", "Year", "FullName",
            "ShortName", "Number", "Address",
            "Name", "Address", "Type", "Link",
            "Furniture", "Longitude", "Latitude", "Professor", "Section",
        ];
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
        Furniture: "furniture",
        Link: "href",
        Seats: "seats",
        Name: "name",
        FullName: "fullname",
        ShortName: "shortname",
        Latitude: "lat",
        Longitude: "lon",
        Address: "address",
        Number: "number",
        Type: "type",
    };

    constructor(id: string) {
        this.id = id;
    }

    public get_data(): object[] { return this.data; }
    public data_setter(data: object[]) { this.data = data; }

    // returns an array of objects matching the query using the data
    public query_data(query: IsplitQuery): object[] {
        // get what we need to show (<id>_<key> as represented in JSON)
        const show: string[] = this.get_show(query.show);
        // O(n) * 2 == O(n) ?, but would be faster if i didnt have to iterate over twice
        // filter data by filter
        let data: object[] = this.filter_data(query.filter);
        // AGGREGATE IF AGGREGATOR, IF not just filter for shows
        if (query.grouped && !isUndefined(query.aggregators)) {
            this.convertAggId(query);
            const grouper: Grouper = new Grouper(data);
            const aggregator: AggregateResults = new AggregateResults(query.aggregators, show);
            const groupedData: { [index: string]: any } = grouper.groupData(show);
            data = aggregator.aggregate(groupedData);
        }
            // if the data is grouped but not aggregated takes the first entry for
        if (query.grouped) {
            data = this.group_without_aggs(data, show);
        }

        // sort if sort is true
        if (query.order) {
            const orderOn: string[] = query.order.getKeys();
            const dir: string = query.order.getDirection();
            data = this.sort_data(data, orderOn, dir);
        }

        //    map so that it only shows what we want (i'm sure there's a nice ES6 way to do this)
        // removes extraneous key, value pairs from data
        // ***I have no idea why title is now coming back as string[] !??!***
        data = data.map((x: { [index: string]: any }) => {
            const y: { [index: string]: string | number } = {};
            for (const s of show) {
                // makes title a string not a string[]
                if (isArray(x[s])) {
                    x[s] = x[s][0];
                }
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
     * modified for custom shows that are not keys
     */
    private get_show(query: string[]): string[] {
        return query.map( (s) => this.KEYS.includes(s) ? this.id_key(s) : s);
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
     * @param query takse split query
     * @return void
     * converts all the Keys in each Aggregator to
     * how they appear in the data using the id
     * ie, Seats -> rooms_seats
     */
    private convertAggId(query: IsplitQuery): void {
       if (!isNull(query.aggregators)) {
            for (const agg of query.aggregators) {
                let key: string = agg.get_key();
                key = this.id_key(key);
                agg.set_key(key);
            }
        }
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
    private sort_data(data: object[], orderOns: string[], dir: string): object[] {
        // if it's a regular key conver it, if not just keep plain
        // i.e, Average -> courses_avg but if myAvg keep myAvg
        orderOns = this.get_show(orderOns);
        if (dir === "up") {
            data = this.sort_desc(data, orderOns);
        } else {
            data = this.sort_asc(data, orderOns);
        }
        return data;
    }

    private sort_desc(data: object[], orderOns: string[]): object[] {
        return data.sort( (a: any, b: any) => this.sort_algo_down(a, b, orderOns));
    }

    private sort_algo_down(a: { [i: string]: number | string },
                           b: { [i: string]: number | string }, keys: string[]): number {
        const key = keys.slice(0, 1)[0];
        if (a[key] > b[key]) {
            return 1;
        }
        if (a[key] < b[key]) {
            return -1;
        }
        if (keys.length === 0) {
            return 0;
        }
        return this.sort_algo_up(a, b, keys.slice(1));
    }

    private sort_asc(data: object[], orderOns: string[]): object[] {
        return data.sort( (a: any, b: any) => this.sort_algo_up(a, b, orderOns));
    }

    private sort_algo_up(a: { [i: string]: number | string },
                         b: { [i: string]: number | string }, keys: string[]): number {
        const key = keys.slice(0, 1)[0];
        if (a[key] > b[key]) {
            return -1;
        }
        if (a[key] < b[key]) {
            return 1;
        }
        if (keys.length === 0) {
            return 0;
        }
        return this.sort_algo_up(a, b, keys.slice(1));
    }
    private group_without_aggs(data: object[], show: string[]): object[] {
        const grouper: Grouper = new Grouper(data);
        const groupedData: { [index: string]: any } = grouper.groupData(show);
        const groups: string[] = Object.keys(groupedData);
        const newData: object[] = [];
        for (const group of groups) {
            newData.push(groupedData[group][0]);
        }
        return newData;
    }

}
