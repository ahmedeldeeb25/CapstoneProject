"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Order {
    constructor(order, show) {
        this.order = order.trim();
        this.validKeys = show;
        this.parse(order);
    }
    getKeys() { return this.keys; }
    getDirection() { return this.direction; }
    validateOrder() {
        return this.validateKeys(this.keys)
            && (/^sort in ascending order by/.test(this.order) || /^sort in descending order by/.test(this.order));
    }
    toString() {
        return `\n\tkey: ${this.keys}, order: ${this.direction}
        \n\t valid keys? ${this.validateKeys(this.keys)}
        \n\t valid length? ${this.order.split(" ").length === 6}
        \n\t valid phrasing? ${(/^sort in ascending order by/.test(this.order)
            || /^sort in descending order by/.test(this.order))};`;
    }
    parse(order) {
        const words = order.split(" order by ");
        const keysPhrase = words[1];
        const keys = keysPhrase.replace(/,/g, " and").split(" and ");
        this.keys = keys;
        if (order.includes("ascending")) {
            this.direction = "up";
        }
        else {
            this.direction = "down";
        }
    }
    validateKeys(keys) {
        for (const key of keys) {
            if (!this.validKeys.includes(key)) {
                return false;
            }
        }
        return true;
    }
}
exports.default = Order;
//# sourceMappingURL=queryOrder.js.map