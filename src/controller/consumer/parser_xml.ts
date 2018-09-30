import * as parse5 from "parse5/lib";
import * as JSzip from "jszip";
import Request, { IGeoResponse } from "./request";
import Parser from "./Parser";

interface IROOM {
    number: string;
    link: string;
    seats: string;
    furniture: string;
    type: string;
}

interface IBUILDING {
    code: string;
    name: string;
    path: string;
    address: string;
    lat: number;
    lon: number;
    rooms: IROOM[];
}

export default class XMLParse extends Parser {

    private index: JSzip.JSZipObject;
    private request: Request = new Request();

    constructor(id: string, content: string) {
        super(id, content);
    }

    public getIndex(): JSzip.JSZipObject {
        return this.index;
    }
    /**
     * Returns the index.xml file contained in the zipped folder
     * Works regardless of the name of the first folder
     * Assumes that there is only one index.xml (as stated in specs)
     */
    public async setIndex(): Promise<boolean> {
        const filename: string = "index.xml";
        let jszip: JSzip;
        let file: JSzip.JSZipObject;
        try {
            jszip = await this.jszip.loadAsync(this.content, { base64: true });
            file = jszip.file(/(index.xml)$/)[0];
            this.jszip = jszip;
            this.index = file;
            if (file) {
                return Promise.resolve(true);
            } else {
                return Promise.resolve(false);
            }
        } catch (err) {
            return Promise.reject(false);
        }
    }

    public async parse(xml?: string): Promise<object[]> {
        if (!xml) {
            if (this.getIndex) {
                try {
                    await this.setIndex();
                } catch (err) {
                    throw Error("Couldn't set index");
                }
            }
            const index: JSzip.JSZipObject = this.getIndex();
            try {
                xml = await index.async("text");
            } catch (err) {
                throw Error("couldn't get contents of index.xml");
            }
        }
        const doc: { [childNodes: string]: any } = parse5.parse(xml);
        // GET to the BUILDINGS
        const html: any = doc.childNodes[1];
        const body: any = html.childNodes[1];
        const container: any = body.childNodes[0];
        // Filter everything thats not a building (text)
        const buildings: any = container.childNodes.filter((x: any) => x.tagName === "building" );
        const data: IBUILDING[] = [];
        const roomsPromises: Array<Promise<{}>> = [];
        const locPromises: Array<Promise<{}>> = [];
        // I think instead of waiting for each promise to finish I need to implement
        // a solution that keeps going and then uses promise.all to wait for everything to be DONE
        for (const building of buildings) {
            const x: any = {};
            // loop through attributes of building tag and make object with name, value pairs
            for (const buildingAttr of building.attrs) {
                x[buildingAttr.name] = buildingAttr.value;
            }
            // loop through attributes of location tag and make object with name, value pairs
            const location: any = building.childNodes.filter( (node: any) => node.tagName === "location");
            const locAttrs: any = location[0].attrs;
            for (const locAttr of locAttrs) {
                x[locAttr.name] = locAttr.value;
            }
            // use the path to parse the file that contains info about the rooms
            const rooms = this.parseRooms(x.path);
            rooms.then( (res) => {
                x["rooms"] = res;
            });
            roomsPromises.push(rooms);
            // use request to get lat and long
            const geoResponse: Promise<IGeoResponse> = this.request.getCoords(x["address"]);
            geoResponse.then( (r) => {
                x["lat"] = r.lat;
                x["lon"] = r.lon;
            });
            locPromises.push(geoResponse);
            data.push(x);
        }
        await Promise.all(locPromises);
        await Promise.all(roomsPromises);
        return this.format_data(data);
    }

    /**
     *
     * @param path filename
     * parses the file that contains info about the rooms
     * @returns Promise<object[]>
     */
    public async parseRooms(path: string): Promise<object[]> {
        path = path.slice(1);
        const pathRegex = new RegExp(path + "$");
        const files: JSzip.JSZipObject[] = this.jszip.file(pathRegex);
        const file = files[0];
        let xml: string;
        try {
            xml = await file.async("text");
        } catch (err) {
            throw Error("error finding file!");
        }
        // get to rooms doc -> html -> body -> building -> rooms
        const doc: any = parse5.parse(xml);
        const html: any = doc.childNodes[1];
        const body: any = html.childNodes[1];
        const building: any = body.childNodes[0];
        const roomsContainer: any = building.childNodes[1];
        // get rid of anything that's not a room
        let rooms: any = roomsContainer.childNodes;
        rooms = rooms.filter( (room: any) => room.tagName === "room");
        // Log.test(inspect(rooms));
        const data = [];
        for (const room of rooms) {
            const newRoom: any = {};
            for (const attr of room.attrs) {
                newRoom[attr.name] = attr.value;
            }
            const webs: any = room.childNodes.filter( (x: any) => x.tagName === "web");
            for (const web of webs) {
                for (const attr of web.attrs) {
                    newRoom[attr.name] = attr.value;
                }
            }
            const spaces: any = webs[0].childNodes.filter( (x: any) => x.tagName === "space");
            for (const space of spaces) {
                for (const attr of space.attrs) {
                    newRoom[attr.name] = attr.value;
                }
            }
            data.push(newRoom);
        }
        return Promise.resolve(data);
    }

    private format_data(buildings: IBUILDING[]): object[] {
        const rooms: object[] = [];
        for (const building of buildings) {
            for (const room of building["rooms"]) {
                const newRoom: any = {};
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
