"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AggregateResults {
    constructor(aggs, show) {
        this.aggs = aggs;
        this.shows = show;
    }
    aggregate(data) {
        const results = [];
        const groups = Object.keys(data);
        for (const group of groups) {
            let newGroup = {};
            for (const agg of this.aggs) {
                const result = agg.aggregate(data[group]);
                newGroup[agg.get_input()] = result;
            }
            newGroup = Object.assign({}, newGroup, data[group][0]);
            results.push(newGroup);
        }
        return results;
    }
}
exports.default = AggregateResults;
//# sourceMappingURL=aggregateResults.js.map