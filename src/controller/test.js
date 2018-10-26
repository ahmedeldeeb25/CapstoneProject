"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
const http = require("https");
const Util_1 = require("../Util");
class PostCode {
    postCode(codestring) {
        const postData = querystring.stringify({
            compilation_level: "ADVANCED_OPTIMIZATIONS",
            output_format: "json",
            output_info: "compiled_code",
            warning_level: "QUIET",
            result: codestring,
        });
        const postOptions = {
            host: "agile-scrubland-17600.herokuapp.com",
            port: "443",
            path: "/add",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData),
            },
        };
        const postReq = http.request(postOptions, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                Util_1.default.test("Response: " + chunk);
            });
        });
        postReq.on("error", (error) => {
            Util_1.default.test(error + " error occurred!");
        });
        postReq.write(postData);
        postReq.end();
    }
}
exports.PostCode = PostCode;
//# sourceMappingURL=test.js.map