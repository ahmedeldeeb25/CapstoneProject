"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryFilter {
    constructor(all = false, andOr, OP) {
        this.andOr = null;
        this.all = all;
        this.andOr = andOr ? andOr : null;
        this.criteria = OP ? OP : null;
    }
    validate_filter() {
        if (this.all) {
            return true;
        }
        else {
            return this.validate_and_or() && this.criteria.validateCriteria();
        }
    }
    toString() {
        if (this.criteria) {
            return `\nandOr: ${this.andOr},
            all?: ${this.all},
            criteria: ${(this.criteria.toString())}\n`;
        }
        else {
            return `andOr: ${this.andOr},
            all?: ${this.all}`;
        }
    }
    validate_and_or() {
        return this.andOr === null || this.andOr === "and" || this.andOr === "or";
    }
}
exports.default = QueryFilter;
//# sourceMappingURL=queryFilter.js.map