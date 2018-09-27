import * as parse5 from "parse5";
import * as JSzip from "jszip";
import Log from "../../Util";
import { inspect, isNull } from "util";

export default class XMLParse {

    private id: string;
    private content: string;
    private jszip: JSzip;
    private index: JSzip.JSZipObject;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
        this.jszip = new JSzip();
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

    public async parse(xml: string): Promise<object[]> {
        const doc: { [childNodes: string]: any } = parse5.parse(xml);
        // GET to the BUILDINGS
        const html: any = doc.childNodes[1];
        const body: any = html.childNodes[1];
        const container: any = body.childNodes[0];
        // Filter everything thats not a building (text)
        const buildings: any = container.childNodes.filter((x: any) => x.tagName === "building" );
        const data: object[] = [];
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
            x["rooms"] = await this.parseRooms(x.path);
            data.push(x);
        }
        return data;
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
}
