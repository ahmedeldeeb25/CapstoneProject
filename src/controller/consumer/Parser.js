"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSzip = require("jszip");
class Parser {
    constructor(id, content) {
        this.id = id;
        this.content = content;
        this.jszip = new JSzip();
    }
}
exports.default = Parser;
//# sourceMappingURL=Parser.js.map