export interface IsplitQuery {
    dataset: string;
    filter: string | string[];
    order: string;
    show: string[];
}

export class SplitQuery {

    private POS_LOOK_AHEAD_AND: RegExp = new RegExp('and(?=(?:(?:[^"]*"){2})*[^"]*$)', "g");
    private POS_LOOK_AHEAD_OR: RegExp = new RegExp('and(?=(?:(?:[^"]*"){2})*[^"]*$)', "g");
    private QUERY: string;
    private SPLIT_QUERY: IsplitQuery;

    constructor(query: string) {
        this.QUERY = query;
        this.split_query(query);
    }

    public get_split_query(): IsplitQuery {
        return this.SPLIT_QUERY;
    }

    /**
     * @param filter "is \"the and that\" and is not equal to 75 or is less than 400"
     * @returns ["is \"the and \that", "and is not equal to 75", "or is less than 400"]]
     * This function is pretty ugly
     */
    public split_filter(filter: string): string[] | string {
        if (filter === "find all entries") {
            return filter;
        } else {
            const splitByAnd: string[] = filter.match(this.POS_LOOK_AHEAD_AND);
            const and: string[] = [];
            const or: string[] = [];
            splitByAnd.forEach( (x) => {
                if (this.POS_LOOK_AHEAD_OR.test(x)) {
                    const first: string = x[0];
                    const second: string = x[1];
                    and.push("and " + first.trim());
                    or.push("or " + second.trim());
                } else {
                    and.push("and " + x.trim());
                }
            });
            return and.concat(or);
        }
    }

    // Returns an object with dataset, filter, show, order (IsplitQuery interface)
    public split_query(query: string): void {
        const commaIndex: number = query.indexOf(",");
        const dataset: string = query.slice(0, commaIndex);
        const semiIndex: number = query.indexOf(";");
        const filter: string = query.slice(commaIndex, semiIndex);
        const lastSemi: number = query.lastIndexOf(";");
        let show: string[];
        let order: string;
        if (lastSemi === semiIndex) {
            show = this.split_show(query.slice(semiIndex, -1));
        } else {
            const temp: string[] = query.slice(semiIndex + 1, -1).split(";");
            show = this.split_show(temp[0]);
            order = temp[1];
        }
        this.SPLIT_QUERY = { dataset, filter, show, order };
    }

    /**
     *
     * @param show "show Department and Title and Audit"
     * @returns ["Department","Title","Audit"]
     *
     */
    private split_show(show: string): string[] {
        return show.split("show ")[1].split(" and ");
    }

}
