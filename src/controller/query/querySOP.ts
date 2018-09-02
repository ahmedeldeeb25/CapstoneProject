import CRITERIA from "./queryOP";
import { isString } from "util";

export default class SOP extends CRITERIA {
    constructor(key: string, OP: string, target: string) {
        super(key, OP, target);
        this.setKeys(["Department", "ID", "Instructor", "Title", "UUID"]);
        this.setPhrases(["is", "is not", "includes", "does not include",
            "begins with", "does not begin with", "ends with", "does not end with"]);
    }
    public validateKey(): boolean {
        return this.getKeys().includes(this.getKey());
    }

    public validateOP(): boolean {
        return this.getPhrases().includes(this.getOP());
    }

    public validateTarget(): boolean {
        return isString(this.getTarget());
    }
}
