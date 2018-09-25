import * as parse5 from "parse5";
import * as JSzip from "jszip";
import Log from "../../Util";

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
        // const document: { } = parse5.parse(xml);
        // for (const node of document.childNodes) {
        //     // TODO
        // }
        return [{}];
    }

    private getBuilding() {
        // TODO
    }
}
