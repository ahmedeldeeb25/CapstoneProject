import Aggregator from "../queryAST/Aggregation";
import Log from "../../Util";
import { isArray, isUndefined, isNull } from "util";

export default class AggregateResults {

    private aggs: Aggregator[];
    private shows: string[];

    constructor(aggs: Aggregator[], show: string[]) {
        this.aggs = aggs;
        this.shows = show;
    }

    // AGGREGATE RESULTS (ALSO HANDLES SHOW)
    // Handling show here isn't the best for couping but it kind of goes hand in hand here
    public aggregate(data: { [index: string]: Array<{ [index: string ]: string | number}>}): object[] {
        // query without args is rejecting

        const results = [];
        // Get all the groups
        const groups: string[] = Object.keys(data);
        // Iterate through all the groups
        for (const group of groups) {
            let newGroup: { [index: string]: number | string } = {};
            for (const agg of this.aggs) {
                // add a new aggregation
                const result: number = agg.aggregate(data[group]);
                newGroup[agg.get_input()] = result;
            }
            // get the rest of what is going to be shown (should be same for all entries)
            // for (const key of this.shows) {
            //     // SKIP IF ALREADY IN NEW GROUP and
            //     // for some reason title is coming back as array???
            //     if (!newGroup[key]) {
            //         let val = data[group][0][key];
            //         if (isArray(val)) {
            //             val = val[0];
            //         }
            //         newGroup[key] = val;
            //     }
            // }
            newGroup = {...newGroup, ...data[group][0]};
            results.push(newGroup);
        }
        return results;
    }

}
