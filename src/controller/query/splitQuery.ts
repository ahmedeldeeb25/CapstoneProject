export interface IsplitQuery {
    dataset: string;
    filter: string | string[];
    order: string;
    show: string[];
}

export class SplitQuery {

    private POS_LOOK_AHEAD_AND: RegExp = new RegExp(/and|or(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    private QUERY: string;
    private SPLIT_QUERY: IsplitQuery;

    constructor(query: string) {
        this.QUERY = query;
        this.split_query(query);
    }

    public get_split_query(): IsplitQuery {
        return this.SPLIT_QUERY;
    }

    // Returns an object with dataset, filter, show, order (IsplitQuery interface)
    private split_query(query: string): void {
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

    /**
     * @param filter "is \"the and that\" and is not equal to 75 or is less than 400"
     * @returns ["and is \"the and \that", "and is not equal to 75", "or is less than 400"]
     */
    private split_filter(filter: string): string[] | string {
        if (filter === "find all entries") {
            return filter;
        } else {
            // TODO
        }
    }

}
