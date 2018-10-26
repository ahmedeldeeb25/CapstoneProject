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
const fs = require("fs");
const restify = require("restify");
const Util_1 = require("../Util");
const InsightFacade_1 = require("../controller/InsightFacade");
const util_1 = require("util");
class Server {
    constructor(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
    }
    stop() {
        Util_1.default.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }
    start() {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Util_1.default.info("Server::start() - start");
                const insightFacade = new InsightFacade_1.default();
                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser());
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });
                that.rest.get("/echo/:msg", Server.echo);
                that.rest.put("/dataset/:id/:kind", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                    const { id, kind } = req.params;
                    let response;
                    let code;
                    try {
                        const buffer = yield (util_1.promisify)(fs.readFile)(req.files.body.path);
                        const content = buffer.toString("base64");
                        response = yield insightFacade.addDataset(id, content, kind);
                        code = 204;
                    }
                    catch (err) {
                        Util_1.default.info("Error occurred " + util_1.inspect(err));
                        response = err;
                        code = 400;
                    }
                    res.json(code, response);
                    return next();
                }));
                that.rest.del("/dataset/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                    const id = req.params.id;
                    let response;
                    let code;
                    try {
                        response = yield insightFacade.removeDataset(id);
                        code = 204;
                    }
                    catch (err) {
                        response = err;
                        code = 404;
                    }
                    res.json(code, response);
                    return next();
                }));
                that.rest.post("/query", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                    let response;
                    let code;
                    try {
                        const query = JSON.parse(req.body).query;
                        response = yield insightFacade.performQuery(query);
                        code = 200;
                    }
                    catch (err) {
                        response = err;
                        code = 400;
                    }
                    res.json(code, response);
                    return next();
                }));
                that.rest.get("/datasets", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                    let code;
                    let response;
                    Util_1.default.info("GET DATASETS");
                    try {
                        response = yield insightFacade.listDatasets();
                        code = 200;
                    }
                    catch (err) {
                        response = err;
                        code = 400;
                    }
                    res.json(code, response);
                    return next();
                }));
                that.rest.get("/.*", Server.getStatic);
                that.rest.listen(that.port, function () {
                    Util_1.default.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });
                that.rest.on("error", function (err) {
                    Util_1.default.info("Server::start() - restify ERROR: " + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.error("Server::start() - ERROR: " + err);
                reject(err);
            }
        });
    }
    static echo(req, res, next) {
        Util_1.default.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const result = Server.performEcho(req.params.msg);
            Util_1.default.info("Server::echo(..) - responding " + result.code);
            res.json(result.code, result.body);
        }
        catch (err) {
            Util_1.default.error("Server::echo(..) - responding 400");
            res.json(400, { error: err.message });
        }
        return next();
    }
    static performEcho(msg) {
        if (typeof msg !== "undefined" && msg !== null) {
            return { code: 200, body: { result: msg + "..." + msg } };
        }
        else {
            return { code: 400, body: { error: "Message not provided" } };
        }
    }
    static getStatic(req, res, next) {
        const publicDir = "frontend/public/";
        Util_1.default.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map