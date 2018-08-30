import Log from "../../Util";
import QueryAST from "./queryAST";
import { IsplitQuery, SplitQuery } from "./splitQuery";

/**
 * Take a query apart and determine if it is valid
 */
export default class ValidateQuery {
    private S_KEY: string[] = ["Department", "ID", "Instructor", "Title", "UUID"];
    private M_KEY: string[] = ["Average", "Pass", "Fail", "Audit"];
    private MORE_KEYS: string = "and";
    private KIND: string[] = ["courses"];

    private S_OP: string[] = ["is", "is not", "includes", "does not include",
        "begins with", "does not begin with", "ends with", "does not end with"];

    private M_OP: string[] = ["greater than", "less than", "equal to"];

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
     * @param key string
     * returns true is key is in S_KEY or M_KEY
     */
    public is_key(key: string) {
        return this.S_KEY.includes(key) || this.M_KEY.includes(key);
    }

    /**
     *
     * @param sOP S_OP
     * return true if S_OP is valid, false if not
     */
    public valid_s_op(sOP: string) {
        const words: string[] = sOP.split(" ");
        const lastWord: string = words[words.length - 1];
        const phrase: string = words.slice(0, -1).join(" ");
        if (this.valid_string(lastWord)) {
            return this.S_OP.includes(phrase);
        } else {
            return false;
        }
    }

    /**
     *
     * @param mOP M_OP
     * return true if M_OP is valid, false if not
     */
    public valid_m_op(mOP: string) {
        const words: string[] = mOP.split(" ");
        const length: number = words.length;
        const firstWord = words[0];
        const lastWord = parseFloat(words[length - 1]);
        if (firstWord !== "is" || isNaN(lastWord) || length < 4 || length > 5) {
            return false;
        } else {
            if (length === 5) {
                if (words[1] !== "not") {
                    return false;
                }
            }
            const phrase: string = length === 4 ? words[1] + " " + words[2] : words[2] + " " + words[3];
            return this.M_OP.includes(phrase);
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

    public valid_filter(filter: string | string[]): boolean {
        return false;
    }

    public valid_show(show: string[]): boolean {
        return false;
    }

    public valid_order(order: string): boolean {
        return false;
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
