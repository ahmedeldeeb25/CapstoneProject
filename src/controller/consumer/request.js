"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
class Request {
    getCoords(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                host: "sdmm.cs.ubc.ca",
                port: 11316,
                method: "GET",
                path: "/api/v1/team_ccunnin8/" + encodeURI(address),
            };
            return new Promise((resolve, reject) => {
                try {
                    http.get(options, (res) => {
                        const { statusCode } = res;
                        const contentType = res.headers["content-type"];
                        let error;
                        if (statusCode !== 200) {
                            error = new Error("Request Failed. Status Code: ${statusCode}");
                        }
                        else if (!/^application\/json/.test(contentType)) {
                            error = new Error("Invalid content-type." +
                                " Expected application / json but received ${ contentType }");
                        }
                        if (error) {
                            res.resume();
                            resolve({
                                lat: 0,
                                lon: 0,
                            });
                        }
                        res.setEncoding("utf8");
                        let rawData = "";
                        res.on("data", (chunk) => { rawData += chunk; });
                        res.on("end", () => {
                            try {
                                const parsedData = JSON.parse(rawData);
                                resolve(parsedData);
                            }
                            catch (err) {
                                resolve({ lat: 0, lon: 0 });
                            }
                        });
                        res.on("error", (err) => {
                            resolve({ lat: 0, lon: 0 });
                        });
                    });
                }
                catch (err) {
                    resolve({ lat: 0, lon: 0 });
                }
            });
        });
    }
}
exports.default = Request;
//# sourceMappingURL=request.js.map