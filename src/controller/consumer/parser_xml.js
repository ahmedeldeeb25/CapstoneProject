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
const parse5 = require("parse5/lib");
const request_1 = require("./request");
const Parser_1 = require("./Parser");
class XMLParse extends Parser_1.default {
    constructor(id, content) {
        super(id, content);
        this.request = new request_1.default();
    }
    getIndex() {
        return this.index;
    }
    setIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = "index.xml";
            let jszip;
            let file;
            try {
                jszip = yield this.jszip.loadAsync(this.content, { base64: true });
                file = jszip.file(/(index.xml)$/)[0];
                this.jszip = jszip;
                this.index = file;
                if (file) {
                    return Promise.resolve(true);
                }
                else {
                    return Promise.resolve(false);
                }
            }
            catch (err) {
                return Promise.reject(false);
            }
        });
    }
    parse(xml) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!xml) {
                    if (this.getIndex) {
                        try {
                            yield this.setIndex();
                        }
                        catch (err) {
                            return Promise.reject(Error("Couldn't set index"));
                        }
                    }
                    const index = this.getIndex();
                    try {
                        xml = yield index.async("text");
                    }
                    catch (err) {
                        return Promise.reject(Error("couldn't get contents of index.xml"));
                    }
                }
                const doc = parse5.parse(xml);
                const html = doc.childNodes[1];
                const body = html.childNodes[1];
                const container = body.childNodes[0];
                const buildings = container.childNodes.filter((x) => x.tagName === "building");
                const data = [];
                const roomsPromises = [];
                const locPromises = [];
                for (const building of buildings) {
                    const x = {};
                    for (const buildingAttr of building.attrs) {
                        x[buildingAttr.name] = buildingAttr.value;
                    }
                    const location = building.childNodes.filter((node) => node.tagName === "location");
                    const locAttrs = location[0].attrs;
                    for (const locAttr of locAttrs) {
                        x[locAttr.name] = locAttr.value;
                    }
                    const rooms = this.parseRooms(x.path);
                    rooms.then((res) => {
                        x["rooms"] = res;
                    }).catch((err) => {
                        if (err) {
                            return Promise.reject(Error("Error parsing rooms"));
                        }
                    });
                    roomsPromises.push(rooms);
                    const geoResponse = this.request.getCoords(x["address"]);
                    geoResponse.then((r) => {
                        x["lat"] = r.lat;
                        x["lon"] = r.lon;
                    }).catch((err) => {
                        if (err) {
                            x["lat"] = err;
                            x["lon"] = err;
                        }
                    });
                    locPromises.push(geoResponse);
                    data.push(x);
                }
                yield Promise.all(locPromises).catch((err) => {
                    if (err) {
                        return Promise.reject(Error("error occured getting locations"));
                    }
                });
                yield Promise.all(roomsPromises).catch((err) => {
                    if (err) {
                        return Promise.reject(Error("error occured getting rooms"));
                    }
                });
                return Promise.resolve(this.format_data(data));
            }
            catch (err) {
                if (err) {
                    return Promise.reject(Error("something went wrong with get request!"));
                }
            }
        });
    }
    parseRooms(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                path = path.slice(1);
                const pathRegex = new RegExp(path + "$");
                const files = this.jszip.file(pathRegex);
                const file = files[0];
                let xml;
                try {
                    xml = yield file.async("text");
                }
                catch (err) {
                    if (err) {
                        return Promise.reject(Error("error finding file!"));
                    }
                }
                const doc = parse5.parse(xml);
                const html = doc.childNodes[1];
                const body = html.childNodes[1];
                const building = body.childNodes[0];
                const roomsContainer = building.childNodes[1];
                let rooms = roomsContainer.childNodes;
                rooms = rooms.filter((room) => room.tagName === "room");
                const data = [];
                for (const room of rooms) {
                    const newRoom = {};
                    for (const attr of room.attrs) {
                        newRoom[attr.name] = attr.value;
                    }
                    const webs = room.childNodes.filter((x) => x.tagName === "web");
                    for (const web of webs) {
                        for (const attr of web.attrs) {
                            newRoom[attr.name] = attr.value;
                        }
                    }
                    const spaces = webs[0].childNodes.filter((x) => x.tagName === "space");
                    for (const space of spaces) {
                        for (const attr of space.attrs) {
                            newRoom[attr.name] = attr.value;
                        }
                    }
                    data.push(newRoom);
                }
                return Promise.resolve(data);
            }
            catch (err) {
                if (err) {
                    return Promise.reject(Error("an error occured in parsing rooms"));
                }
            }
        });
    }
    format_data(buildings) {
        const rooms = [];
        for (const building of buildings) {
            for (const room of building["rooms"]) {
                const newRoom = {};
                newRoom[`${this.id}_name`] = `${building.code}_${room["number"]}`;
                newRoom[`${this.id}_fullname`] = building.name;
                newRoom[`${this.id}_shortname`] = building.code;
                newRoom[`${this.id}_seats`] = parseFloat(room.seats);
                newRoom[`${this.id}_furniture`] = room.furniture;
                newRoom[`${this.id}_href`] = room.link;
                newRoom[`${this.id}_type`] = room.type;
                newRoom[`${this.id}_address`] = building.address;
                newRoom[`${this.id}_lat`] = building.lat;
                newRoom[`${this.id}_lon`] = building.lon;
                newRoom[`${this.id}_number`] = room.number;
                rooms.push(newRoom);
            }
        }
        return rooms;
    }
}
exports.default = XMLParse;
//# sourceMappingURL=parser_xml.js.map