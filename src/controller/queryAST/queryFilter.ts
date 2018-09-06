import CRITERIA from "./queryOP";

export interface IFILTER {
    all: boolean;
    andOr: null | string;
    criteria: null | CRITERIA;
}

export default class QueryFilter implements IFILTER {
    public all: boolean;
    public andOr: string = null;
    public criteria: null | CRITERIA;

    constructor(all: boolean = false, andOr?: string, OP?: CRITERIA) {
        this.all = all;
        this.andOr = andOr ? andOr : null;
        this.criteria = OP ? OP : null;
    }

    public validate_filter(): boolean {
        if (this.all) {
            return true;
        } else {
            return this.validate_and_or() && this.criteria.validateCriteria();
        }
    }

    private validate_and_or(): boolean {
        return this.andOr === null || this.andOr === "and" || this.andOr === "or";
    }
}
