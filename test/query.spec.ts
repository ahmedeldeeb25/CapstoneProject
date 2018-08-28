import { expect } from "chai";
import ParseQuery from "../src/query/parseQuery";

describe("Query parser", () => {

    const parser: ParseQuery = new ParseQuery();

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
});
