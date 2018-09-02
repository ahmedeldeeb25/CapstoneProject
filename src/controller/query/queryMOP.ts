import CRITERIA from "./queryOP";
import { isNumber } from "util";

export default class MOP extends CRITERIA {
    constructor(key: string, OP: string, target: number) {
        super(key, OP, target);
        this.setKeys(["Average", "Pass", "Fail", "Audit"]);
        this.setPhrases(["greater than", "less than", "equal to"]);
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
}
