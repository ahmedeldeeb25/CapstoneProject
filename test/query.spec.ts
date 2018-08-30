import { expect } from "chai";
import ValidateQuery from "../src/controller/query/validateQuery";
import { SplitQuery } from "../src/controller/query/splitQuery";

describe("Query splitter", () => {
    const splitQuery = new SplitQuery("In rooms dataset rooms, find entries whose Average is greater" +
                                    " than 90 and Department is \"adhe\" " +
                                    "or Average is equal to 95; show Department, ID and Average;" +
                                    " sort in ascending order by Average.");
    const IsplitQuery = splitQuery.get_split_query();

    it("Should have proper dataset", () => {
        const expected: string = "In rooms dataset rooms";
        expect(IsplitQuery.dataset).to.equal(expected);
    });

    it("Should have proper filter", () => {
        const expected: string[] = ["Average is greater than 90",
                                    "Department is \"adhe\"", "or Average is equal to 95"];
        expect(IsplitQuery.filter).to.equal(expected);
    });

    it("Should have proper order", () => {
        const expected: string = "Average";
        expect(IsplitQuery.order).to.equal(expected);
    });

    it("Should have proper show", () => {
        const expected: string[] = ["Department", "ID", "Average"];
        expect(IsplitQuery.show).to.equal(expected);
    });

});
describe("Query parser", () => {
    const splitQuery = new SplitQuery("In courses dataset courses, find all entries; show Average");
    const parser: ValidateQuery = new ValidateQuery(splitQuery);

    it("Should return false if invalid M_OP", () => {
        const expected: boolean = false;
        expect(parser.valid_m_op("is equal 45")).to.equal(expected);
        expect(parser.valid_m_op("is 45")).to.equal(expected);
        expect(parser.valid_m_op("is equal to \"two\"")).to.equal(expected);
        expect(parser.valid_m_op("is not greater than or equal to 45")).to.equal(expected);
        expect(parser.valid_m_op("is > 45")).to.equal(expected);
        expect(parser.valid_m_op("is === 45")).to.equal(expected);
        expect(parser.valid_m_op("is less than \"45\"")).to.equal(expected);
        expect(parser.valid_m_op("is not equal to \"45\"")).to.equal(expected);
        expect(parser.valid_m_op("is equal to \"45\"")).to.equal(expected);
    });

    it("Should return true if valid M_OP", () => {
        const expected: boolean = true;
        expect(parser.valid_m_op("is equal to 45")).to.equal(expected);
        expect(parser.valid_m_op("is not equal to 45")).to.equal(expected);
        expect(parser.valid_m_op("is equal to 2")).to.equal(expected);
        expect(parser.valid_m_op("is not greater than 45")).to.equal(expected);
        expect(parser.valid_m_op("is greater than 45")).to.equal(expected);
        expect(parser.valid_m_op("is less than 45")).to.equal(expected);
        expect(parser.valid_m_op("is not equal to 45")).to.equal(expected);
    });

    it("Should return true if valid S_OP", () => {
        const expected: boolean = true;
        expect(parser.valid_s_op("is \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("is not \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("includes \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("does not include \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("begins with \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("does not begin with \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("ends with \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("does not end with \"test\"")).to.equal(expected);
    });

    it("Should return invalid if invalid S_OP", () => {
        const expected: boolean = false;
        expect(parser.valid_s_op("is test")).to.equal(expected);
        expect(parser.valid_s_op("is equal to \"test\"")).to.equal(expected);
        expect(parser.valid_s_op("includes test")).to.equal(expected);
        expect(parser.valid_s_op("does not equal 45")).to.equal(expected);
        expect(parser.valid_s_op("begins with test")).to.equal(expected);
        expect(parser.valid_s_op("does not begin with test")).to.equal(expected);
        expect(parser.valid_s_op("ends with test")).to.equal(expected);
        expect(parser.valid_s_op("does end with 45")).to.equal(expected);
    });

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
