import * as parse5 from "parse5";
import * as JSzip from "jszip";
import Log from "../../Util";
import { inspect } from "util";

export default class XMLParse {

    private id: string;
    private content: string;
    private jszip: JSzip;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
        this.jszip = new JSzip();
    }

    /**
     * Returns the index.xml file contained in the zipped folder
     * Works regardless of the name of the first folder
     * Assumes that there is only one index.xml (as stated in specs)
     */
    public async getIndex(): Promise<JSzip.JSZipObject> {
        const filename: string = "index.xml";
        let jszip: JSzip;
        let file: JSzip.JSZipObject;
        try {
            jszip = await this.jszip.loadAsync(this.content, { base64: true });
            file = jszip.file(/(index.xml)$/)[0];
        } catch (err) {
            Log.test("error occured opening file!");
            return Promise.reject(err);
        }
        return Promise.resolve(file);
    }

    public parse(xml: string): object[] {
        const doc: { [childNodes: string]: any } = parse5.parse(xml);
        // GET to the BUILDINGS
        const html: any = doc.childNodes[1];
        const body: any = html.childNodes[1];
        const container: any = body.childNodes[0];
        // Filter everything thats not a building (text)
        let buildings: any = container.childNodes.filter((x: any) => x.tagName === "building" );
        buildings = buildings.map( (building: any) => {
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
            return x;
        });
        return buildings;
    }

    private async parseRooms(path: string): Promise<object[]> {
        const file: JSzip.JSZipObject = this.jszip.file(path);
        const xml: string = await file.async("text");
        const doc: any = parse5.parse(xml);
        const html: any = doc.childNodes[1];
        const body: any = html.childNodes[1];
        const building: any = body.childNodes[0];
        let rooms: any = building.childNodes[0];
        rooms = rooms.filter( (room: any) => room.tagName === "room" );
        return Promise.resolve([{}]);
    }
}
