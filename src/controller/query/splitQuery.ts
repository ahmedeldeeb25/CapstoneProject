import QueryFilter from "./queryFilter";
import Order from "./queryOrder";
import SOP from "./querySOP";
import MOP from "./queryMOP";

export interface IsplitQuery {
    dataset: string;
    filter: QueryFilter | QueryFilter[];
    order: Order;
    show: string[];
}

export class SplitQuery {

    private POS_LOOK_AHEAD_AND: RegExp = new RegExp('(?=and|or(?:(?:[^"]*"){2})*[^"]*$)', "g");
    private QUERY: string;
    private SPLIT_QUERY: IsplitQuery;

    constructor(query: string) {
        this.QUERY = query;
        this.split_query(query);
    }
    // Returns an object with dataset, filter, show, order (IsplitQuery interface)
    // This method could use some prettying up
    public split_query(query: string): void {
        const sepBySemi: string[] = query.split(";");
        const sepByComa: string[] = sepBySemi[0].split(",");
        const dataset: string = sepByComa[0].trim();
        const filter: QueryFilter | QueryFilter[] = this.split_filter(sepByComa[1].trim());
        const show: string[] = this.split_show(sepBySemi[1].trim());
        let order: Order = null;
        if (sepBySemi.length === 3) {
            order = new Order(sepBySemi[2].trim().slice(0, -1));
        }
        this.SPLIT_QUERY = { dataset, filter, show, order };
    }

    public get_split_query(): IsplitQuery {
        return this.SPLIT_QUERY;
    }

    /**
     * @param filter "is \"the and that\" and is not equal to 75 or is less than 400"
     * @returns QueryFilters built with ["is \"the and \that", "and is not equal to 75", "or is less than 400"]]
     *
     */
    private split_filter(filter: string): QueryFilter | QueryFilter[] {
        if (filter === "find all entries") {
            return new QueryFilter(true);
        } else {
            const criteria: string = filter.split("find entries whose")[1].trim();
            // splits into list of individual CRITERIA
            const splitByAndOr: string[] = criteria.split(this.POS_LOOK_AHEAD_AND);
            return this.parse_criteria(splitByAndOr);
        }
    }

    /**
     *
     * @param show "show Department and Title and Audit"
     * @returns ["Department","Title","Audit"]
     *
     */
    private split_show(show: string): string[] {
        return show.trim().split(" ").filter( (x) => x !== "show").filter( (x) => x !== "and");
    }

    // returns an array of criteria, maybe criteria should be objects

    private parse_criteria(criteria: string[]): QueryFilter[] {
        const filterList: QueryFilter[] = [];
        for (const c of criteria) {
            const words: string[] = c.trim().split(" ");
            let andOr: string = null;
            let key: string;
            let OP: SOP | MOP;
            const target: string = words.pop();
            if (words[0] === "and" || words[0] === "or" ) {
                andOr = words.shift();
                key = words.shift();
            } else {
                key = words.shift();
            }
            // target is a string
            if (isNaN(parseFloat(target))) {
                OP = new SOP(key, words.join(" "), target);
            // target is a number
            } else {
                OP = new MOP(key, words.slice(1).join(" "), parseFloat(target));
            }
            filterList.push(new QueryFilter(false, andOr, OP));
        }
        return filterList;
    }

}
