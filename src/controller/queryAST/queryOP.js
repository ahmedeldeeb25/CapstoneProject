"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CRITERIA {
    constructor(key, OP, target) {
        this.key = key;
        this.OP = OP;
        this.target = target;
    }
    getKey() { return this.key; }
    getOP() { return this.OP; }
    getTarget() { return this.target; }
    getKeys() { return this.keys; }
    getPhrases() { return this.phrases; }
    setKeys(keys) { this.keys = keys; }
    setPhrases(phrases) { this.phrases = phrases; }
    setKey(key) { this.key = key; }
    validateCriteria() {
        return this.validateOP() && this.validateKey() && this.validateTarget();
    }
    toString() {
        return `OP: ${this.getOP()} Key: ${this.getKey()} ` +
            `Target: ${this.getTarget()} Valid: ${this.validateCriteria()}\n`;
    }
}
exports.default = CRITERIA;
//# sourceMappingURL=queryOP.js.map