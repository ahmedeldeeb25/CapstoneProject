
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
        if (this.mKeys.includes(this.key)) {
            if (!this.mAggs.includes(this.aggregator)) {
                return false;
            }
        }
        return true;
    }
}
