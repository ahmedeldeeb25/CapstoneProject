import Aggregator from "../queryAST/Aggregation";

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
        const results = [];
        // Get all the groups
        const groups: string[] = Object.keys(data);
        // Iterate through all teh groups
        for (const group of groups) {
            const newGroup: { [index: string]: number | string } = {};
            for (const agg of this.aggs) {
                // add a new aggregation
                newGroup[agg.get_input()] = agg.aggregate(data[group]);
            }
            for (const key of this.shows) {
                newGroup[key] = data[group][0][key];
            }
            results.push(newGroup);
        }
        return results;
    }

}
