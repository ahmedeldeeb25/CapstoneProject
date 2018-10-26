"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const groupResults_1 = require("./groupResults");
const aggregateResults_1 = require("./aggregateResults");
class QueryEngine {
    constructor(id) {
        this.KEYS = ["Average", "Pass", "Fail",
            "Audit", "Department", "ID",
            "Instructor", "Title", "UUID",
            "Seats", "Year", "FullName",
            "ShortName", "Number", "Address",
            "Name", "Address", "Type", "Link",
            "Furniture", "Longitude", "Latitude", "Professor", "Section",
        ];
        this.keysMap = {
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
        this.id = id;
    }
    get_data() { return this.data; }
    data_setter(data) { this.data = data; }
    query_data(query) {
        const show = this.get_show(query.show);
        let data = this.filter_data(query.filter);
        if (query.grouped && !util_1.isUndefined(query.aggregators)) {
            this.convertAggId(query);
            const grouper = new groupResults_1.default(data);
            const aggregator = new aggregateResults_1.default(query.aggregators, show);
            const groupedData = grouper.groupData(show);
            data = aggregator.aggregate(groupedData);
        }
        else if (query.grouped) {
            data = this.group_without_aggs(data, show);
        }
        if (query.order) {
            const orderOn = query.order.getKeys();
            const dir = query.order.getDirection();
            data = this.sort_data(data, orderOn, dir);
        }
        data = data.map((x) => {
            const y = {};
            for (const s of show) {
                y[s] = x[s];
            }
            return y;
        });
        return data;
    }
    get_show(query) {
        return query.map((s) => this.KEYS.includes(s) ? this.id_key(s) : s);
    }
    id_key(key) {
        return this.id + "_" + this.keysMap[key];
    }
    convertAggId(query) {
        if (!util_1.isNull(query.aggregators)) {
            for (const agg of query.aggregators) {
                let key = agg.get_key();
                key = this.id_key(key);
                agg.set_key(key);
            }
        }
    }
    filter_data(filter) {
        const data = this.data;
        if (!util_1.isArray(filter)) {
            return data;
        }
        else {
            return data.filter((x) => {
                let result;
                for (const f of filter) {
                    const key = this.id_key(f.criteria.getKey());
                    let target = f.criteria.getTarget();
                    if (util_1.isString(target)) {
                        target = target.slice(1, -1);
                    }
                    const fun = f.criteria.getFunc();
                    if (f.andOr === "and") {
                        result = result && fun(x[key], target);
                    }
                    else if (f.andOr === "or") {
                        result = result || fun(x[key], target);
                    }
                    else {
                        result = fun(x[key], target);
                    }
                }
                return result;
            });
        }
    }
    sort_data(data, orderOns, dir) {
        orderOns = this.get_show(orderOns);
        if (dir === "up") {
            data = this.sort_desc(data, orderOns);
        }
        else {
            data = this.sort_asc(data, orderOns);
        }
        return data;
    }
    sort_desc(data, orderOns) {
        return data.sort((a, b) => this.sort_algo_down(a, b, orderOns));
    }
    sort_algo_down(a, b, keys) {
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
    sort_asc(data, orderOns) {
        return data.sort((a, b) => this.sort_algo_up(a, b, orderOns));
    }
    sort_algo_up(a, b, keys) {
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
    group_without_aggs(data, show) {
        const grouper = new groupResults_1.default(data);
        const groupedData = grouper.groupData(show);
        const groups = Object.keys(groupedData);
        const newData = [];
        for (const group of groups) {
            newData.push(groupedData[group][0]);
        }
        return newData;
    }
}
exports.default = QueryEngine;
//# sourceMappingURL=retrieveResults.js.map