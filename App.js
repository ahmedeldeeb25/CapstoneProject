"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./src/rest/Server");
const Util_1 = require("./src/Util");
class App {
    initServer(port) {
        Util_1.default.info("App::initServer( " + port + " ) - start");
        const server = new Server_1.default(port);
        server.start().then(function (val) {
            Util_1.default.info("App::initServer() - started: " + val);
        }).catch(function (err) {
            Util_1.default.error("App::initServer() - ERROR: " + err.message);
        });
    }
}
exports.App = App;
Util_1.default.info("App - starting");
const app = new App();
const myPort = process.env.PORT || 4321;
app.initServer(myPort);
//# sourceMappingURL=App.js.map