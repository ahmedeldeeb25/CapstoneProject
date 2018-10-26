"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class ValidateQuery {
    constructor(splitQuery) {
        this.KIND = ["courses", "test", "rooms"];
        this.KEYS = ["Average", "Pass", "Fail",
            "Audit", "Department", "ID",
            "Instructor", "Title", "UUID",
            "Seats", "Year", "FullName",
            "ShortName", "Number", "Address",
            "Name", "Address", "Type", "Link",
            "Furniture", "Longitude", "Latitude",
        ];
        this.KEYWORDS = [
            "In", "dataset", "find", "all", "show", "and", "or", "sort",
            "by", "entries", "is", "the", "of", "whose", "where",
        ];
        this.AGG_KEYS = [];
        this.SPLIT_QUERY = splitQuery;
        if (splitQuery.get_split_query().aggregators) {
            this.get_agg_keys(splitQuery.get_split_query().aggregators);
        }
    }
    valid_query(query) {
        if (query.slice(-1) !== "." || query.split(",").length < 2) {
            return false;
        }
        const splitQuery = this.SPLIT_QUERY.get_split_query();
        const { dataset } = splitQuery;
        const { filter } = splitQuery;
        const { order } = splitQuery;
        const { show } = splitQuery;
        const { groupedBy } = splitQuery;
        const { aggregators } = splitQuery;
        return this.valid_dataset(dataset) && this.valid_filter(filter)
            && this.valid_show(show, aggregators) && this.valid_order(order)
            && this.valid_groups(groupedBy, show) && this.valid_aggregators(aggregators);
    }
    valid_dataset(dataset) {
        let words;
        const grouped = this.SPLIT_QUERY.get_split_query().grouped;
        if (grouped) {
            const splitDataset = dataset.split("grouped by");
            words = splitDataset[0].trim().split(" ");
        }
        else {
            words = dataset.split(" ");
        }
        return words[0] === "In"
            && this.valid_kind(words[1])
            && words[2] === "dataset"
            && this.valid_input(words[3])
            && words.length === 4;
    }
    valid_filter(filter) {
        if (util_1.isArray(filter)) {
            for (const i of filter) {
                if (!i.validate_filter()) {
                    return false;
                }
            }
        }
        else {
            return filter.validate_filter();
        }
        return true;
    }
    valid_show(show, aggregators) {
        for (const agg of this.AGG_KEYS) {
            if (!show.includes(agg)) {
                return false;
            }
        }
        for (const key of show) {
            if (!this.KEYS.includes(key)) {
                if (!this.AGG_KEYS.includes(key)) {
                    return false;
                }
            }
        }
        return true;
    }
    valid_order(order) {
        if (order) {
            return order.validateOrder();
        }
        else {
            return true;
        }
    }
    valid_aggregators(aggregators) {
        if (this.SPLIT_QUERY.get_split_query().aggregators) {
            for (const agg of aggregators) {
                if (!agg.validate()) {
                    return false;
                }
            }
            const inputs = [];
            for (const agg of aggregators) {
                const input = agg.get_input();
                if (inputs.includes(input)) {
                    return false;
                }
                else {
                    inputs.push(input);
                }
            }
            return true;
        }
        return true;
    }
    valid_groups(groups, show) {
        if (this.SPLIT_QUERY.get_split_query().grouped) {
            for (const group of groups) {
                if (this.KEYS.includes(group) && show.includes(group)) {
                    return true;
                }
            }
            return false;
        }
        else {
            return true;
        }
    }
    toString() {
        const splitQuery = this.SPLIT_QUERY.get_split_query();
        const { dataset, filter, order, show, groupedBy, grouped, aggregators } = splitQuery;
        return `\n\tDataset: ${this.valid_dataset(dataset)}
                \n\tFilter: ${this.valid_filter(filter)}
                \n\tShow: ${this.valid_show(show, aggregators)}
                \n\tOrder: ${this.valid_order(order)}
                \n\tGroups: ${this.valid_groups(groupedBy, show)}
                \n\tAggregators: ${this.valid_aggregators(aggregators)}`;
    }
    valid_kind(kind) {
        return this.KIND.includes(kind);
    }
    valid_input(input) {
        return !this.KEYWORDS.includes(input)
            && !input.includes("_")
            && !input.includes(" ");
    }
    get_agg_keys(aggs) {
        for (const agg of aggs) {
            this.AGG_KEYS.push(agg.get_input());
        }
    }
}
exports.default = ValidateQuery;
//# sourceMappingURL=validateQuery.js.map