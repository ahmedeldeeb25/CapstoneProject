"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queryFilter_1 = require("./queryFilter");
const queryOrder_1 = require("./queryOrder");
const querySOP_1 = require("./querySOP");
const queryMOP_1 = require("./queryMOP");
class SplitQuery {
    constructor(query) {
        this.regex = '(?= and (?:(?:[^"]*"){2})*[^"]*$| or (?:(?:[^"]*"){2})*[^"]*$)';
        this.POS_LOOK_AHEAD_AND = new RegExp(this.regex, "g");
        this.COMMA = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        this.SEMI = /;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        query = query.replace(/Full Name(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g, "FullName");
        query = query.replace(/Short Name(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g, "ShortName");
        this.split_query(query);
    }
    split_query(query) {
        let sepBySemi;
        let sepByComa;
        sepBySemi = query.split(this.SEMI);
        if (sepBySemi.length < 2) {
            throw new Error("Incorrectly formatted query");
        }
        sepByComa = sepBySemi[0].split(this.COMMA);
        if (sepByComa.length < 2) {
            throw new Error("Incorrectly formatted query");
        }
        const dataset = sepByComa[0].trim();
        const filter = this.split_filter(sepByComa[1].slice(1).trim());
        const show = this.split_show(sepBySemi[1].trim());
        let order = null;
        if (sepBySemi.length === 3) {
            order = new queryOrder_1.default(sepBySemi[2].trim().slice(0, -1), show);
        }
        this.SPLIT_QUERY = { dataset, filter, show, order, grouped: false };
    }
    get_split_query() {
        return this.SPLIT_QUERY;
    }
    get_input() {
        if (this.SPLIT_QUERY.dataset) {
            return this.SPLIT_QUERY.dataset.split(" ")[3];
        }
        else {
            throw new Error("dataset undefined");
        }
    }
    get_filter_keys() {
        const keys = [];
        for (const filter of this.get_split_query().filter) {
            const key = filter.criteria.getKey();
            if (!keys.includes(key)) {
                keys.push(key);
            }
        }
        return keys;
    }
    toString() {
        return `\n\tdataset: ${this.get_split_query().dataset}
        \nfilter: ${this.get_split_query().filter.toString()}
        \norder: ${this.get_split_query().order}
        \nshow: ${this.get_split_query().show}`;
    }
    split_filter(filter) {
        if (filter === "find all entries") {
            return new queryFilter_1.default(true);
        }
        else {
            const criteria = filter.split("find entries whose")[1];
            let splitByAndOr;
            splitByAndOr = criteria.split(this.POS_LOOK_AHEAD_AND);
            return this.parse_criteria(splitByAndOr);
        }
    }
    split_show(show) {
        show = show.trim();
        if (show.slice(-1) === ".") {
            show = show.slice(0, -1);
        }
        show = show.replace(/,/g, "");
        return show.split(" ").filter((x) => x !== "show").filter((x) => x !== "and");
    }
    parse_criteria(criteria) {
        const filterList = [];
        for (const c of criteria) {
            const words = c.trim().split(/\s(?=(?:[^"']|["|'][^"']*")*$)/);
            let andOr = null;
            let key;
            let OP;
            const target = words.pop();
            if (words[0] === "and" || words[0] === "or") {
                andOr = words.shift();
                key = words.shift();
            }
            else {
                key = words.shift();
            }
            if (isNaN(parseFloat(target))) {
                OP = new querySOP_1.default(key, words.join(" "), target);
            }
            else {
                OP = new queryMOP_1.default(key, words.slice(1).join(" "), parseFloat(target));
            }
            filterList.push(new queryFilter_1.default(false, andOr, OP));
        }
        return filterList;
    }
}
exports.SplitQuery = SplitQuery;
//# sourceMappingURL=splitQuery.js.map