"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queryOP_1 = require("./queryOP");
const util_1 = require("util");
class SOP extends queryOP_1.default {
    constructor(key, OP, target) {
        super(key, OP, target);
        this.mOP = {
            "is": (a, b) => a === b,
            "is not": (a, b) => a !== b,
            "includes": (a, b) => a.includes(b),
            "does not include": (a, b) => !a.includes(b),
            "begins with": (a, b) => new RegExp(`^${b}`).test(a),
            "does not begin with": (a, b) => !new RegExp(`^${b}`).test(a),
            "ends with": (a, b) => new RegExp(`${b}$`).test(a),
            "does not end with": (a, b) => !new RegExp(`${b}$`).test(a),
        };
        this.setKeys(["Department", "ID", "Instructor", "Title", "UUID",
            "FullName", "ShortName", "Number", "Name", "Address", "Type", "Furniture", "Link"]);
        this.setPhrases(["is", "is not", "includes", "does not include",
            "begins with", "does not begin with", "ends with", "does not end with"]);
    }
    validateKey() {
        return this.getKeys().includes(this.getKey());
    }
    validateOP() {
        return this.getPhrases().includes(this.getOP());
    }
    validateTarget() {
        return util_1.isString(this.getTarget());
    }
    getFunc() {
        return this.mOP[this.getOP()];
    }
}
exports.default = SOP;
//# sourceMappingURL=querySOP.js.map