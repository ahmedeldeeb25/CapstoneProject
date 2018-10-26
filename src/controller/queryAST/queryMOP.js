"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queryOP_1 = require("./queryOP");
const util_1 = require("util");
class MOP extends queryOP_1.default {
    constructor(key, OP, target) {
        super(key, OP, target);
        this.mOP = {
            "greater than": (a, b) => a > b,
            "less than": (a, b) => a < b,
            "equal to": (a, b) => a === b,
            "not greater than": (a, b) => a <= b,
            "not less than": (a, b) => a >= b,
            "not equal to": (a, b) => a !== b,
        };
        this.setKeys(["Average", "Pass", "Fail", "Audit", "Latitude", "Longitude", "Seats", "Year"]);
        this.setPhrases(["greater than", "less than", "equal to", "not greater than",
            "not less than", "not equal to"]);
    }
    validateKey() {
        return this.getKeys().includes(this.getKey());
    }
    validateOP() {
        return this.getPhrases().includes(this.getOP());
    }
    validateTarget() {
        return util_1.isNumber(this.getTarget());
    }
    getFunc() {
        return this.mOP[this.getOP()];
    }
}
exports.default = MOP;
//# sourceMappingURL=queryMOP.js.map