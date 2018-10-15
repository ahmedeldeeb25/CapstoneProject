import Log from "../../Util";

export default class Aggregator {
    // TODO
    private input: string;
    private aggregator: string;
    private key: string;
    private aggs: string[] = ["MIN", "MAX", "AVG", "SUM", "COUNT"];
    private mAggs: string[] = ["MIN", "MAX", "AVG", "SUM"];
    private mKeys: string[] = ["Average", "Pass", "Fail", "Audit", "Latitude", "Longitude", "Seats", "Year"];
    private sKeys: string[] = [
        "Department", "ID", "Instructor",
        "Title", "UUID", "FullName", "ShortName", "Number",
        "Name", "Address", "Type", "Furniture", "Link",
    ];

    constructor(input: string, aggregator: string, key: string) {
        this.input = input;
        this.aggregator = aggregator;
        this.key = key;
    }

    public get_key(): string {
        return this.key;
    }

    public get_input(): string {
        return this.input;
    }

    public get_aggregator(): string {
        return this.aggregator;
    }

    public set_key(key: string) {
        this.key = key;
    }

    public validate(): boolean {
        // "Apply keys can't have _ "
        if (this.input.includes("_")) {
            return false;
        }
        // Apply must be MIN | AVG | SUM | COUNT
        if (!this.aggs.includes(this.aggregator)) {
            return false;
        }
        // MIN | AVG | SUM only work on mKey
        if (this.mAggs.includes(this.aggregator)) {
            if (!this.mKeys.includes(this.key)) {
                return false;
            }
        }
        return true;
    }

    public aggregate(data: Array<{ [index: string]: number | string }>): number {
        switch (this.aggregator) {
            case "MAX":
                return this.max(data);
            case "MIN":
                return this.min(data);
            case "SUM":
                return this.sum(data);
            case "COUNT":
                return this.count(data);
            case "AVG":
                return this.avg(data);
        }
    }

    public toString(): string {
        return `\n\tKEY: ${this.key}, INPUT: ${this.input}, AGG: ${this.aggregator}`;
    }
    // returns the sum of given data group
    private sum(data: Array<{ [index: string]: number | string }>): number {
        let sum: number = 0;
        for (const d of data) {
            sum += d[this.key] as number;
        }
        return +sum.toFixed(2);
    }

    // returns the max of given data group
    private max(data: Array<{ [index: string]: number | string }>): number {
        const nums: number[] = [];
        for (const d of data) {
            nums.push(d[this.key] as number);
        }
        return Math.max(...nums);
    }

    // returns the min of given data group
    private min(data: Array<{ [index: string]: number | string }>): number {
        const nums: number[] = [];
        for (const d of data) {
            nums.push(d[this.key] as number);
        }
        return Math.min(...nums);
    }

    // returns the avg of given data group
    private avg(data: Array<{ [index: string]: number | string }>): number {
        let sum: number = 0;
        let count: number = 0;
        for (const d of data) {
            sum += d[this.key] as number;
            count += 1;
        }
        return +(sum / count).toFixed(2);
    }

    // returns the unique instances of whatever the key is
    private count(data: Array<{ [index: string]: number | string }>): number {
        const uniques: Array<number | string> = [];
        for (const d of data) {
            if (!uniques.includes(d[this.key])) {
                uniques.push(d[this.key]);
            }
        }
        return uniques.length;
    }
}
