import { expect } from "chai";
import ValidateQuery from "../src/controller/query/validateQuery";
import { SplitQuery } from "../src/controller/query/splitQuery";
import QueryFilter from "../src/controller/query/queryFilter";
import MOP from "../src/controller/query/queryMOP";
import SOP from "../src/controller/query/querySOP";
import Order from "../src/controller/query/queryOrder";

describe("Query splitter", () => {
    const splitQuery = new SplitQuery("In rooms dataset rooms, find entries whose Average is greater" +
                                    " than 90 and Department is \"adhe\" " +
                                    "or Average is equal to 95; show Department and ID and Average;" +
                                    " sort in ascending order by Average.");
    const IsplitQuery = splitQuery.get_split_query();

    it("Should have proper dataset", () => {
        const expected: string = "In rooms dataset rooms";
        expect(IsplitQuery.dataset).to.equal(expected);
    });

    it("Should have proper filter", () => {
        const q1: QueryFilter = {
            all: false,
            andOr: null,
            criteria: new MOP("Average", "greater than", 90),
        };
        const q2: QueryFilter = {
            all: false,
            andOr: "and",
            criteria: new SOP("Department", "is", "\"adhe\""),
        };
        const q3: QueryFilter = {
            all: false,
            andOr: "or",
            criteria: new MOP("Average", "equal to", 95),
        };
        const expected: QueryFilter[] = [q1, q2, q3];
        expect(IsplitQuery.filter).to.deep.equal(expected);
    });

    it("Should have proper order", () => {
        const expected: Order = new Order("sort in ascending order by Average");
        expect(IsplitQuery.order).to.deep.equal(expected);
    });

    it("Should have proper show", () => {
        const expected: string[] = ["Department", "ID", "Average"];
        expect(IsplitQuery.show).to.deep.equal(expected);
    });

    it("Should split filter", () => {
        const expected: string[] = ["and Average is greater than 90",
                                    "and Department is \"adhe\"",
                                    "or Average is equal to 95"];

    });

});
describe("QueryOP", () => {

    it("Should return false if invalid M_OP KEY", () => {
        const expected: boolean = false;
        const mop: MOP = new MOP("Department", "is greater than", 45);
        const actual: boolean = mop.validateCriteria();
        expect(expected).to.equal(actual);
    });

    it("Should return true if invalid M_OP OP", () => {
        const expected: boolean = false;
        const mop: MOP = new MOP("Audt", "includes", 45);
        const actual: boolean = mop.validateCriteria();
        expect(expected).to.equal(actual);
    });

    it("Should return true if valid M_OP OP", () => {
        const expected: boolean = true;
        const mop: MOP = new MOP("Audit", "greater than", 45);
        const actual: boolean = mop.validateCriteria();
        expect(expected).to.equal(actual);
    });

    it("Should return false if ivalid S_OP key", () => {
        const expected: boolean = false;
        const sop: SOP = new SOP("Average", "starts with", "g");
        const actual: boolean = sop.validateCriteria();
        expect(expected).to.equal(actual);
    });

    it("Should return false if invalid S_OP OP", () => {
        const expected: boolean = false;
        const sop: SOP = new SOP("Title", "is greater than", "g");
        const actual: boolean = sop.validateCriteria();
        expect(expected).to.equal(actual);
    });

    it("Should return true if valid S_OP", () => {
        const expected: boolean = true;
        const sop: SOP = new SOP("Title", "is", "Harry Potter");
        const actual: boolean = sop.validateCriteria();
        expect(expected).to.equal(actual);
    });
});

describe("Order", () => {

    it("Should return true with valid order", () => {
        const order: Order = new Order("sort in ascending order by Average");
        const actual: boolean = order.validateOrder();
        const expected: boolean = true;
        expect(actual).to.equal(expected);
    });

    it("Should return false with invalid order", () => {
        const order: Order = new Order("sort in descending order by Average");
        const actual: boolean = order.validateOrder();
        const expected: boolean = false;
        expect(actual).to.equal(expected);
    });

    it("Should return false with invalid order", () => {
        const order: Order = new Order("descending order by Average");
        const actual: boolean = order.validateOrder();
        const expected: boolean = false;
        expect(actual).to.equal(expected);
    });

    it("Should return false with invalid order", () => {
        const order: Order = new Order("sort in descending order by Average Department Title");
        const actual: boolean = order.validateOrder();
        const expected: boolean = false;
        expect(actual).to.equal(expected);
    });

});

describe("Validate Query", () => {
    const splitQuery: SplitQuery = new SplitQuery("In courses dataset courses, find all entries; show Department.");
    const parser: ValidateQuery = new ValidateQuery(splitQuery);
    it("Should validate valid query from q1", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is greater than 97;" +
                                "show Department and Average; sort in ascending order by Average.";
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query from q2", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is greater than 90"
        + "and Department is \"adhe\""
        + "or Average is equal to 95; show Department, ID and Average; sort in ascending order by Average.";
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query from q3", () => {
        const expected: boolean = false;
        const query: string = "in rooms dataset abc, find entries whose Seats is greater than 80; show Seats.";
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query from q4", () => {
        const expected: boolean = false;
        const query: string = "In rooms dataset abc, find entries whose Seats is greater than 80; "
        + "show Seats and Address; sort in ascending order by Average2.";
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query from q5", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is less than 97"
        + " and id is \"400\"; show Department and Average; sort in ascending order by Average.";
        expect(parser.valid_query(query)).to.equal(expected);
    });

});
