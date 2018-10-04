import { SplitQuery } from "./splitQuery";
import QueryFilter from "./queryFilter";
import Order from "./queryOrder";
import Aggregator from "./Aggregation";

export default class SplitGroupQuery extends SplitQuery {

    constructor(query: string) {
        super(query);
        this.SPLIT_QUERY.grouped = true;
    }

    public split_query(query: string) {
        let sepBySemi: string[];
        // DATASET , FILTER ; DISPLAY; ORDER.
        sepBySemi = query.split(this.SEMI);
        // Must have at least DATASET, FILTER; DISPLAY
        if (sepBySemi.length < 2) { throw new Error("Incorrectly formatted query"); }
        // Get Filter out of Dataset, filter
        const findFilter: number = sepBySemi[0].indexOf(", find");
        const dataset: string = sepBySemi[0].slice(0, findFilter);
        const filters: string = sepBySemi[0].slice(findFilter + 2);
        const groupedBy = this.split_grouped_by(dataset);
        const filter: QueryFilter | QueryFilter[] = this.split_filter(filters);
        // "show Average, Title, FullName and special where special is the AVG of Average" ->
        // ["show Average, Title, FullName and special", "special is the AVG of Average"]
        const showAndAgg: string[] = sepBySemi[1].trim().split(" where ");
        const show: string[] = this.split_show(showAndAgg[0]);
        const aggregators: Aggregator[] = this.split_aggregators(showAndAgg[1]);
        let order: Order = null;
        if (sepBySemi.length === 3) {
            order = new Order(sepBySemi[2].trim().slice(0, -1), show);
        }
        this.SPLIT_QUERY = { dataset, filter, show, order, grouped: true, groupedBy, aggregators };
    }

    public toString(): string {
        return `\n\tdataset: ${this.get_split_query().dataset}
        \nfilter: ${this.get_split_query().filter.toString()}
        \norder: ${this.get_split_query().order}
        \nshow: ${this.get_split_query().show}
        \ngrouped: ${this.get_split_query().grouped}
        \ngroupedBy: ${this.get_split_query().groupedBy}
        \naggregator: ${this.get_split_query().aggregators}`;
    }

    /**
     *  @param aggregators "where minAvg is the MIN of Average"
     */
    private split_aggregators(aggregators: string): Aggregator[] {
        // s1 is the MIN of Average, s2 is the MAX of Average and s3 is the SUM of Fail =>
        // s1 is the Min of Average and s2 is the MAX of Average and s3 is the SUM of Fail
        const aggs: string[] = aggregators.replace(/,/g, " and").split(" and ");
        const aggList: Aggregator[] = [];
        for (const agg of aggs) {

            // [input, aggregator, key]
            const splitAgg: string[] = agg.split(" is the ").join(" ").split(" of ").join(" ").split(" ");

            if (splitAgg.length !== 3) {
                throw Error("Incorrectly formatted aggregators");
            }
            const input: string = splitAgg[0];
            const aggregator: string = splitAgg[1];
            const key: string = splitAgg[2];
            aggList.push(new Aggregator(input, aggregator, key));
        }
        return aggList;
    }
    // Parses the DATASET_GROUP and extracts the keys that are used to group the data
    /**
     *
     * @param dataset "In courses dataset courses grouped by Title, FullName and Link"
     * @returns string[]: ["Title", "FullName", "Link"]
     */
    private split_grouped_by(dataset: string): string[] {
        // trim dataset just in case
        dataset = dataset.split("grouped by")[1].trim();
        // commas ?
        dataset = dataset.replace(/,/g, "");
        // split show into words and filter out words that are not keys
        return dataset.split(" ").filter((x) => x !== "and");
    }
}
