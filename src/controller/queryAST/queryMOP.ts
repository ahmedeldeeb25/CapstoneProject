import CRITERIA from "./queryOP";
import { isNumber } from "util";

export default class MOP extends CRITERIA {
    protected mOP: { [index: string]: (a: number, b: number) => boolean } = {
        "greater than": (a: number, b: number): boolean => a > b,
        "less than": (a: number, b: number): boolean => a < b,
        "equal to": (a: number, b: number): boolean => a === b,
        "not greater than": (a: number, b: number) => a <= b,
        "not less than": (a: number, b: number) => a >= b,
        "not equal to": (a: number, b: number) => a !== b,
    };

    constructor(key: string, OP: string, target: number) {
        super(key, OP, target);
        this.setKeys(["Average", "Pass", "Fail", "Audit", "Latitude", "Longitude", "Seats", "Year"]);
        this.setPhrases(["greater than", "less than", "equal to", "not greater than",
                    "not less than", "not equal to"]);
    }
    public validateKey(): boolean {
        return this.getKeys().includes(this.getKey());
    }

    public validateOP(): boolean {
        return this.getPhrases().includes(this.getOP());
    }

    public validateTarget(): boolean {
        return isNumber(this.getTarget());
    }

    public getFunc(): (a: string | number, b: string | number) => boolean {
        return this.mOP[this.getOP()];
    }

}
