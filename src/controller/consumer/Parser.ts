
import * as JSzip from "jszip";

export default abstract class Parser {
    protected id: string;
    protected content: string;
    protected jszip: JSzip;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
        this.jszip = new JSzip();
    }
    public abstract parse(xml?: string): Promise<object[]>;
}
