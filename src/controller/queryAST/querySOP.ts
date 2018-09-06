import CRITERIA from "./queryOP";
import { isString } from "util";

export default class SOP extends CRITERIA {
    protected mOP: { [index: string]: (a: string, b: string) => boolean } = {
        "is" : (a: string, b: string) => a === b,
        "is not": (a: string, b: string) => a !== b,
        "includes": (a: string, b: string) => a.includes(b),
        "does not include": (a: string, b: string) => !a.includes(b),
        "begins with": (a: string, b: string) => new RegExp(`^${b}`).test(a),
        "does not begin with": (a: string, b: string) => ! new RegExp(`${b}`).test(a),
        "ends with": (a: string, b: string) =>  new RegExp(`${b}$`).test(a),
        "does not end with": (a: string, b: string) => ! new RegExp(`${b}$`).test(a),
    };

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

    public getFunc(): (a: string | number, b: string | number) => boolean {
        return this.mOP[this.getOP()];
    }

}
