"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Aggregator {
    constructor(input, aggregator, key) {
        this.aggs = ["MIN", "MAX", "AVG", "SUM", "COUNT"];
        this.mAggs = ["MIN", "MAX", "AVG", "SUM"];
        this.mKeys = ["Average", "Pass", "Fail", "Audit", "Latitude", "Longitude", "Seats", "Year"];
        this.sKeys = [
            "Department", "ID", "Instructor",
            "Title", "UUID", "FullName", "ShortName", "Number",
            "Name", "Address", "Type", "Furniture", "Link",
        ];
        this.input = input;
        this.aggregator = aggregator;
        this.key = key;
    }
    get_key() {
        return this.key;
    }
    get_input() {
        return this.input;
    }
    get_aggregator() {
        return this.aggregator;
    }
    set_key(key) {
        this.key = key;
    }
    validate() {
        if (this.input.includes("_")) {
            return false;
        }
        if (!this.aggs.includes(this.aggregator)) {
            return false;
        }
        if (this.mAggs.includes(this.aggregator)) {
            if (!this.mKeys.includes(this.key)) {
                return false;
            }
        }
        return true;
    }
    aggregate(data) {
        switch (this.aggregator) {
            case "MAX":
                return this.max(data);
            case "MIN":
                return this.min(data);
            case "SUM":
                return this.sum(data);
            case "COUNT":
                return this.count(data);
            case "AVG":
                return this.avg(data);
        }
    }
    toString() {
        return `\n\tKEY: ${this.key}, INPUT: ${this.input}, AGG: ${this.aggregator}`;
    }
    sum(data) {
        let sum = 0;
        for (const d of data) {
            sum += d[this.key];
        }
        return +sum.toFixed(2);
    }
    max(data) {
        const nums = [];
        for (const d of data) {
            nums.push(d[this.key]);
        }
        return Math.max(...nums);
    }
    min(data) {
        const nums = [];
        for (const d of data) {
            nums.push(d[this.key]);
        }
        return Math.min(...nums);
    }
    avg(data) {
        let sum = 0;
        let count = 0;
        for (const d of data) {
            sum += d[this.key];
            count++;
        }
        return Number((sum / count).toFixed(2));
    }
    count(data) {
        const uniques = [];
        for (const d of data) {
            if (!uniques.includes(d[this.key])) {
                uniques.push(d[this.key]);
            }
        }
        return uniques.length;
    }
}
exports.default = Aggregator;
//# sourceMappingURL=Aggregation.js.map