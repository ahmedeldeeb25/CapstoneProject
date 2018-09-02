import { IsplitQuery, SplitQuery } from "./splitQuery";
import QueryFilter from "./queryFilter";
import Order from "./queryOrder";

/**
 * Take a query apart and determine if it is valid
 */
export default class ValidateQuery {
    private MORE_KEYS: string = "and";
    private KIND: string[] = ["courses"];

    private KEYWORDS: string[] = [
        "In", "dataset", "find", "all", "show", "and", "or", "sort", "by", "entries", "is", "the", "of", "whose",
    ];

    private ORDER: string = "sort in ascending order by";
    private SHOW: string = "show";
    private FILTER_ALL: string = "find all entries";
    private FILTER: string = "find entries whose";
    private SPLIT_QUERY: SplitQuery;

    public constructor(splitQuery: SplitQuery) {
        this.SPLIT_QUERY = splitQuery;
    }

    /**
     *
     * @param query the string representation of the query
     * @returns boolean, if the query is valid or not
     * breaks the query apart and validates each section
     *
     */
    public valid_query(query: string): boolean {
        if (query[-1] !== "." || query.split(",").length < 2) {
            return false;
        }

        const splitQuery: IsplitQuery = this.SPLIT_QUERY.get_split_query();
        const { dataset } = splitQuery;
        const { filter } = splitQuery;
        const { order} = splitQuery;
        const { show } = splitQuery;

        return this.valid_dataset(dataset) && this.valid_filter(filter)
            && this.valid_show(show) && this.valid_order(order);
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
        const words: string[] = dataset.split(" ");
        return words[0] === "In"
            && this.valid_kind(words[1])
            && words[2] === "dataset"
            && this.valid_input(words[3]);
    }

    public valid_filter(filter: QueryFilter | QueryFilter[]): boolean {
        return false;
    }

    public valid_show(show: string[]): boolean {
        return false;
    }

    public valid_order(order: Order): boolean {
        return order.validateOrder();
    }

    private valid_kind(kind: string): boolean {
        return this.KIND.includes(kind);
    }

    // Returns true if a string is enveloped in double quotes and does not contain a * and doesnt contain a "
    private valid_string(word: string): boolean {
        return /^\"\w*\"$/.test(word) && !word.includes("*") && !word.split("").slice(1, -1).join("").includes("\"");
    }

    // Input is not a key word, has no _ and no " "
    private valid_input(input: string): boolean {
        return !this.KEYWORDS.includes(input)
            && !input.includes("_")
            && !input.includes(" ");
    }
}
