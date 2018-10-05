import { IsplitQuery, SplitQuery } from "./splitQuery";
import QueryFilter from "./queryFilter";
import Order from "./queryOrder";
import { isArray } from "util";
import Log from "../../Util";
import Aggregator from "./Aggregation";

/**
 * Take a query apart and determine if it is valid
 */
export default class ValidateQuery {
    // test included for testing purposes
    private KIND: string[] = ["courses", "test", "rooms"];
    private KEYS: string[] =
    ["Average", "Pass", "Fail",
    "Audit", "Department", "ID",
    "Instructor", "Title", "UUID",
    "Seats", "Year", "FullName",
    "ShortName", "Number", "Address",
    "Name", "Address", "Type", "Link",
    "Furniture", "Longitude", "Latitude",
    ];
    private KEYWORDS: string[] = [
        "In", "dataset", "find", "all", "show", "and", "or", "sort",
        "by", "entries", "is", "the", "of", "whose", "where",
    ];

    private SPLIT_QUERY: SplitQuery;
    private AGG_KEYS: string[] = [];

    public constructor(splitQuery: SplitQuery) {
        this.SPLIT_QUERY = splitQuery;
        // work around, originally in show but two for of loops were acting like they were async...?
        if (splitQuery.get_split_query().aggregators) {
            this.get_agg_keys(splitQuery.get_split_query().aggregators);
        }
    }

    /**
     *
     * @param query the string representation of the query
     * @returns boolean, if the query is valid or not
     * breaks the query apart and validates each section
     *
     */
    public valid_query(query: string): boolean {
        if (query.slice(-1) !== "." || query.split(",").length < 2) {
            return false;
        }

        const splitQuery: IsplitQuery = this.SPLIT_QUERY.get_split_query();
        const { dataset } = splitQuery;
        const { filter } = splitQuery;
        const { order} = splitQuery;
        const { show } = splitQuery;
        const { groupedBy } = splitQuery;
        const { aggregators } = splitQuery;
        return this.valid_dataset(dataset) && this.valid_filter(filter)
            && this.valid_show(show, aggregators) && this.valid_order(order)
            && this.valid_groups(groupedBy) && this.valid_aggregators(aggregators);
    }

    /**
     *
     * @param dataset "In courses dataset courses"
     * confirms that first words is In (capitalized)
     * second word is a valid KIND
     * third word is dataset
     * fourth word is valid input
     */
    public valid_dataset(dataset: string): boolean {
        let words: string[];
        const grouped: boolean | undefined = this.SPLIT_QUERY.get_split_query().grouped;
        // Just check beginning part of DATASET_GROUPED if grouped else do normal (will check groupedBy idependently)
        if (grouped) {
            const splitDataset = dataset.split("grouped by");
            words = splitDataset[0].trim().split(" ");
        } else {
            words = dataset.split(" ");
        }
        // TODO UPDATE FOR dataset grouped by
        return words[0] === "In"
            && this.valid_kind(words[1])
            && words[2] === "dataset"
            && this.valid_input(words[3])
            && words.length === 4;
    }

    public valid_filter(filter: QueryFilter | QueryFilter[]): boolean {
        if (isArray(filter)) {
            for (const i of filter) {
                if (!i.validate_filter()) {
                    return false;
                }
            }
        } else {
            return filter.validate_filter();
        }
        return true;
    }

    public valid_show(show: string[], aggregators?: Aggregator[]): boolean {
        // Make sure all the aggregator inputs are also in show
        for (const agg of this.AGG_KEYS) {
            if (!show.includes(agg)) {
                return false;
            }
        }
        // make sure show keys are all either keys or aggregator inputs
        for (const key of show) {
            // If it's not a regular key, then it needs to be an aggregator key
            if (!this.KEYS.includes(key)) {
                if (!this.AGG_KEYS.includes(key)) {
                    return false;
                }
            }
        }
        return true;
    }

    public valid_order(order: Order): boolean {
        if (order) {
            return order.validateOrder();
        } else {
            return true;
        }
    }

    public valid_aggregators(aggregators: Aggregator[]): boolean {
        // Guard if there are no aggregators
        if (this.SPLIT_QUERY.get_split_query().aggregators) {
            for (const agg of aggregators) {
                if (!agg.validate()) {
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    public valid_groups(groups: string[]): boolean {
        if (this.SPLIT_QUERY.get_split_query().grouped) {
            for (const group of groups) {
                if (!this.KEYS.includes(group)) {
                    return false;
                }
            }
            return true;
        } else {
            return true;
        }
    }

    public toString(): string {
        const splitQuery: IsplitQuery = this.SPLIT_QUERY.get_split_query();
        const { dataset, filter, order, show, groupedBy, grouped, aggregators } = splitQuery;
        return `\n\tDataset: ${this.valid_dataset(dataset)}
                \n\tFilter: ${this.valid_filter(filter)}
                \n\tShow: ${this.valid_show(show, aggregators)}
                \n\tOrder: ${this.valid_order(order)}
                \n\tGroups: ${this.valid_groups(groupedBy)}
                \n\tAggregators: ${this.valid_aggregators(aggregators)}`;
    }

    private valid_kind(kind: string): boolean {
        return this.KIND.includes(kind);
    }

    // Input is not a key word, has no _ and no " "
    private valid_input(input: string): boolean {
        return !this.KEYWORDS.includes(input)
            && !input.includes("_")
            && !input.includes(" ");
    }

    private get_agg_keys(aggs: Aggregator[]): void {
        for (const agg of aggs) {
            this.AGG_KEYS.push(agg.get_input());
        }
    }

}
