"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Grouper {
    constructor(data) {
        this.data = data.slice();
    }
    get_data() { return this.data; }
    groupData(keys, data = this.data) {
        const newData = {};
        for (const d of data) {
            const val = [];
            for (const k of keys) {
                val.push(d[k]);
            }
            const newKey = val.join("-");
            if (newData[newKey]) {
                newData[newKey].push(d);
            }
            else {
                newData[newKey] = [d];
            }
        }
        return newData;
    }
}
exports.default = Grouper;
//# sourceMappingURL=groupResults.js.map