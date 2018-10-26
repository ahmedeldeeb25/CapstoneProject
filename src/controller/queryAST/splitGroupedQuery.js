"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const splitQuery_1 = require("./splitQuery");
const queryOrder_1 = require("./queryOrder");
const Aggregation_1 = require("./Aggregation");
class SplitGroupQuery extends splitQuery_1.SplitQuery {
    constructor(query) {
        super(query);
        this.SPLIT_QUERY.grouped = true;
    }
    split_query(query) {
        let sepBySemi;
        sepBySemi = query.split(this.SEMI);
        if (sepBySemi.length < 2) {
            throw new Error("Incorrectly formatted query");
        }
        const findFilter = sepBySemi[0].indexOf(", find");
        const dataset = sepBySemi[0].slice(0, findFilter);
        const filters = sepBySemi[0].slice(findFilter + 2);
        const groupedBy = this.split_grouped_by(dataset);
        const filter = this.split_filter(filters);
        const showAndAgg = sepBySemi[1].trim().split(" where ");
        const show = this.split_show(showAndAgg[0]);
        let aggregators;
        if (showAndAgg.length === 2) {
            aggregators = this.split_aggregators(showAndAgg[1]);
        }
        let order = null;
        if (sepBySemi.length === 3) {
            order = new queryOrder_1.default(sepBySemi[2].trim().slice(0, -1), show);
        }
        this.SPLIT_QUERY = { dataset, filter, show, order, grouped: true, groupedBy, aggregators };
    }
    toString() {
        return `\n\tdataset: ${this.get_split_query().dataset}
        \nfilter: ${this.get_split_query().filter.toString()}
        \norder: ${this.get_split_query().order}
        \nshow: ${this.get_split_query().show}
        \ngrouped: ${this.get_split_query().grouped}
        \ngroupedBy: ${this.get_split_query().groupedBy}
        \naggregator: ${this.get_split_query().aggregators}`;
    }
    split_aggregators(aggregators) {
        if (aggregators.slice(-1) === ".") {
            aggregators = aggregators.slice(0, -1);
        }
        const aggs = aggregators.replace(/,/g, " and").split(" and ");
        const aggList = [];
        for (const agg of aggs) {
            const splitAgg = agg.split(" is the ").join(" ").split(" of ").join(" ").split(" ");
            if (splitAgg.length !== 3) {
                throw Error("Incorrectly formatted aggregators");
            }
            const input = splitAgg[0];
            const aggregator = splitAgg[1];
            const key = splitAgg[2];
            aggList.push(new Aggregation_1.default(input, aggregator, key));
        }
        return aggList;
    }
    split_grouped_by(dataset) {
        dataset = dataset.split("grouped by")[1].trim();
        dataset = dataset.replace(/,/g, "");
        return dataset.split(" ").filter((x) => x !== "and");
    }
}
exports.default = SplitGroupQuery;
//# sourceMappingURL=splitGroupedQuery.js.map