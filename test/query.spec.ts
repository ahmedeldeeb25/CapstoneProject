import { expect } from "chai";
import ValidateQuery from "../src/controller/queryAST/validateQuery";
import { SplitQuery } from "../src/controller/queryAST/splitQuery";
import QueryFilter from "../src/controller/queryAST/queryFilter";
import MOP from "../src/controller/queryAST/queryMOP";
import SOP from "../src/controller/queryAST/querySOP";
import Order from "../src/controller/queryAST/queryOrder";
import SplitGroupQuery from "../src/controller/queryAST/splitGroupedQuery";

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
        const q1: QueryFilter = new QueryFilter(false, null, new MOP("Average", "greater than", 90));
        const q2: QueryFilter = new QueryFilter(false, "and", new SOP("Department", "is", "\"adhe\""));
        const q3: QueryFilter = new QueryFilter(false, "or", new MOP("Average", "equal to", 95));
        const filters: QueryFilter[] = IsplitQuery.filter as QueryFilter[];
        // these should deeply equal each other, there's no field that's different so i made them strings
        // but that really wasn't testing anything so...
        expect(filters[0].criteria.getOP()).to.equal(q1.criteria.getOP());
        expect(filters[1].criteria.getOP()).to.equal(q2.criteria.getOP());
        expect(filters[2].criteria.getOP()).to.equal(q3.criteria.getOP());
        expect(filters[0].criteria.getTarget()).to.equal(q1.criteria.getTarget());
        expect(filters[1].criteria.getTarget()).to.equal(q2.criteria.getTarget());
        expect(filters[2].criteria.getTarget()).to.equal(q3.criteria.getTarget());
        expect(filters[0].criteria.getKey()).to.equal(q1.criteria.getKey());
        expect(filters[1].criteria.getKey()).to.equal(q2.criteria.getKey());
        expect(filters[2].criteria.getKey()).to.equal(q3.criteria.getKey());
    });

    it("Should have proper filter", () => {
        const query: string = "In courses dataset courses, " +
            "find entries whose Instructor includes \"bob\"; show ID.";
        const filters: QueryFilter[] = (new SplitQuery(query).get_split_query().filter) as QueryFilter[];
        const filterLength: number = 1;
        const criteria: string = "OP: includes Key: Instructor Target: \"bob\" Valid: true\n";
        expect(filters[0].criteria.getTarget()).to.equal("\"bob\"");
        expect(filters[0].criteria.getKey()).to.equal("Instructor");
        expect(filters[0].criteria.getOP()).to.equal("includes");
        expect(filters.length).to.equal(filterLength);
        expect(filters[0].criteria.toString()).to.equal(criteria);
    });

    it("Should have proper order", () => {
        const expected: Order = new Order("sort in ascending order by Average", ["Department", "ID", "Average"]);
        expect(IsplitQuery.order).to.deep.equal(expected);
    });

    it("Should have proper show", () => {
        const expected: string[] = ["Department", "ID", "Average"];
        expect(IsplitQuery.show).to.deep.equal(expected);
    });

    it("Should split filter with more than two words in string", () => {
        const split = new SplitQuery("In rooms dataset rooms, find entries whose Average is not greater" +
            " than 90 and Department is \"fuck this shit\" " +
            "or Average is not equal to 95; show Department and ID and Average;" +
            " sort in ascending order by Average.");
        const AST = split.get_split_query();
        const filters: QueryFilter[] = AST.filter as QueryFilter[];
        const q1: QueryFilter = new QueryFilter(false, null, new MOP("Average", "not greater than", 90));
        const q2: QueryFilter = new QueryFilter(false, "and", new SOP("Department", "is", '"fuck this shit"'));
        const q3: QueryFilter = new QueryFilter(false, "or", new MOP("Average", "not equal to", 95));
        expect(filters[0].criteria.getOP()).to.equal(q1.criteria.getOP());
        expect(filters[1].criteria.getOP()).to.equal(q2.criteria.getOP());
        expect(filters[2].criteria.getOP()).to.equal(q3.criteria.getOP());
        expect(filters[0].criteria.getTarget()).to.equal(q1.criteria.getTarget());
        expect(filters[1].criteria.getTarget()).to.equal(q2.criteria.getTarget());
        expect(filters[2].criteria.getTarget()).to.equal(q3.criteria.getTarget());
        expect(filters[0].criteria.getKey()).to.equal(q1.criteria.getKey());
        expect(filters[1].criteria.getKey()).to.equal(q2.criteria.getKey());
        expect(filters[2].criteria.getKey()).to.equal(q3.criteria.getKey());
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
        const order: Order = new Order("sort in ascending order by Average", ["Average"]);
        const actual: boolean = order.validateOrder();
        const expected: boolean = true;
        expect(actual).to.equal(expected);
    });

    it("Should return false with invalid order", () => {
        const order: Order = new Order("sort in descending order by Average", ["Average"]);
        const actual: boolean = order.validateOrder();
        const expected: boolean = true;
        expect(actual).to.equal(expected);
    });

    it("Should return false with invalid order", () => {
        const order: Order = new Order("descending order by Average", ["Average"]);
        const actual: boolean = order.validateOrder();
        const expected: boolean = false;
        expect(actual).to.equal(expected);
    });

    it("Should return false with invalid order", () => {
        const order: Order = new Order("sort in descending order by Average Department Title", ["Average"]);
        const actual: boolean = order.validateOrder();
        const expected: boolean = false;
        expect(actual).to.equal(expected);
    });

});

describe("Validate Query", () => {
    it("Should validate valid query from q1", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is greater than 97;" +
            "show Department and Average; sort in ascending order by Average.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query from q2", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is greater than 90 "
            + "and Department is \"adhe\" "
            + "or Average is equal to 95; show Department and ID and Average; sort in ascending order by Average.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query from q3", () => {
        const expected: boolean = false;
        const query: string = "in rooms dataset abc, find entries whose Seats is greater than 80; show Seats.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query from q4", () => {
        const expected: boolean = false;
        const query: string = "In rooms dataset abc, find entries whose Seats is greater than 80; "
            + "show Seats and Address; sort in ascending order by Average2.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query from q5", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is less than 97"
            + " and ID is \"400\"; show Department and Average; sort in ascending order by Average.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should validate query with a not MOP", () => {
        const expected: boolean = true;
        const query: string = "In courses dataset courses, find entries whose Average is not greater than 90 "
            + "and Department is \"adhe\" "
            + "or Average is equal to 95; show Department and ID and Average; sort in ascending order by Average.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate show; true with valid keys", () => {
        const validKeys: string[] = ["Department", "Title", "Audit"];
        const expected: boolean = true;
        const parser: ValidateQuery = new ValidateQuery(new SplitQuery("In courses dataset courses, " +
            "find all entries; show Department."));
        expect(parser.valid_show(validKeys)).to.equal(expected);
    });

    it("Should validate show; false with invalid keys", () => {
        const invalidKeys: string[] = ["Appaloosa", "Title", "Audit", "Jonathon"];
        const expected: boolean = false;
        const parser: ValidateQuery = new ValidateQuery(new SplitQuery("In courses dataset courses, " +
            "find all entries; show Department."));
        expect(parser.valid_show(invalidKeys)).to.equal(expected);
    });

    it("Should validate query: with invalid SOP (target is number)", () => {
        const query: string = "In courses dataset courses, " +
            "find entries whose Average is greater than 97 or ID is equal to 329; " +
            "show Department and Average and ID; sort in ascending order by Average.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        const expected: boolean = false;
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should valid query true with other dataset", () => {
        const query: string = "In test dataset test, find all entries; show Title.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        const expected: boolean = true;
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should return false with invalid input", () => {
        const query: string = "In courses dataset course titles, "
            + "find entries whose Average is equal to 45; show Average and Instructor.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        const expected: boolean = false;
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("Should return true for this very long query", () => {
        const query: string = "In courses dataset courses, " +
            "find entries whose Department is \"elec\" and ID is \"292\"" +
            " and UUID is \"30872\" and Instructor is \"calvino-fraga, jesus\"" +
            " and Pass is equal to 19 and Fail is equal to 0 and Audit is equal to 0" +
            " and Title is \"biom dsgn studio\" and Average is equal to 89.68;" +
            " show Department and ID and UUID and Instructor and Pass and Fail and Audit and Title and Average.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        const expected: boolean = true;
        expect((splitQuery.get_split_query().filter as QueryFilter[]).length).to.equal(9);
        expect(parser.valid_query(query)).to.equal(expected);
    });

    it("validate query", () => {
        const query = "In courses dataset courses, find entries whose Audit is not less than 4" +
            " and Average is not equal to 45 and Pass is not greater than 1 and ID begins with \"5\";" +
            " show Average and ID and Title and UUID.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("validate query", () => {
        const query = "In courses dataset courses, find entries whose Pass is not greater than 5 and " +
            "Pass is not greater than 6 and Pass is not greater than 7; show ID.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("validate query", () => {
        const query = "In courses dataset courses, find entries whose ID begins with \"a\" and " +
            "ID ends with \"z\" and ID includes \"g\"; show UUID.";
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("validate query with single quotes and no escapes", () => {
        const query = "In courses dataset courses, find entries whose " +
            'ID begins with "a" and ID ends with "z" and ID includes "g"; show UUID.';
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("shoud validate with differnet input", () => {
        const query = "In courses dataset horses, find entries whose " +
            'ID begins with "a" and ID ends with "z" and ID includes "g"; show UUID.';
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("shoud validate with differnet input", () => {
        const query = "In courses dataset horses, find entries whose " +
            'ID begins with "a" and ID ends with "z" and ID includes "g"; show UUID.';
        const splitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate with commas in the show", () => {
        const query = "In courses dataset courses, find entries whose Average is greater than 95;" +
            " show Average, ID, UUID, and Title.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate grouped query", () => {
        const query = "In courses dataset courses grouped by Department, find entries whose Department is \"cpsc\";" +
            " show Department, and avgGrade, where avgGrade is the AVG of Average.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate grouped query with order up", () => {
        const query = "In courses dataset courses grouped by Department, find entries whose Department is \"cpsc\";" +
            " show Department, Average and avgGrade, where avgGrade is the AVG of Average;"
            + " sort in ascending order by Average.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate grouped query with order down", () => {
        const query = "In courses dataset courses grouped by Department, find entries whose Department is \"cpsc\";" +
            " show Department, Average and avgGrade, where avgGrade is the AVG of Average;"
            + " sort in descending order by Average.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate grouped query multiple aggregations", () => {
        const query = "In courses dataset courses grouped by Department, find entries whose Department is \"cpsc\";" +
            " show Department, minGrade and avgGrade, where avgGrade is the AVG of Average and" +
            " minGrade is the MIN of Fail.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate grouped query multiple aggregations multiple groups", () => {
        const query = "In courses dataset courses grouped by Department and ID,"
            + " find entries whose Department is \"cpsc\";" +
            " show Department, minGrade and avgGrade, where avgGrade is the AVG of Average and" +
            " minGrade is the MIN of Fail.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate grouped query multiple aggregations multiple groups full name in search", () => {
        const query = "In courses dataset courses grouped by Department and ID,"
            + " find entries whose Full Name is \"Full Name\";" +
            " show Department, minGrade and avgGrade, where avgGrade is the AVG of Average and" +
            " minGrade is the MIN of Fail.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query with new keywords Latitude is greater than 47", () => {
        const query = "In rooms dataset rooms, find entries whose Latitude is greater than 47;"
            + " show Name and Full Name.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query with new keywords Longitude less than 100", () => {
        const query = "In rooms dataset rooms, find entries whose Longitude is less than -100;"
            + " show Name and Full Name.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query with new keywords Full Name begins with a", () => {
        const query = "In rooms dataset rooms, find entries whose Full Name begins with \"a\";"
            + " show Name, Full Name, Short Name and Seats.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query with new keywords Seats === 100", () => {
        const query = "In rooms dataset rooms, find entries whose Seats is equal to 100;"
            + " show Name, Full Name, Short Name and Link.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should validate query with new keywords Type includes chair", () => {
        const query = "In rooms dataset rooms, find entries whose Type includes \"chair\";"
            + " show Address, Full Name, Short Name and Link.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_10.json query", () => {
        const query = "In rooms dataset rooms, find entries whose Name is \"ANGU_039\";"
            + " show Name, Full Name, Short Name, Seats, Furniture, Link, Type, Address, Latitude and Longitude.";
        const splitQuery: SplitQuery = new SplitQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_11.json query", () => {
        const query = "In courses dataset courses grouped by Title, find entries whose ID is \"400\"; show Title.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_12.json query", () => {
        const query = "In courses dataset courses grouped by Title, find entries whose ID is \"400\";"
            + " show Title and avg, where avg is the AVG of Average.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_13.json query", () => {
        const query = "In courses dataset courses grouped by ID, find entries whose ID is \"400\";"
            + " show ID and passers, where passers is the SUM of Pass.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_14.json query", () => {
        const query = "In courses dataset courses grouped by ID, find entries whose ID is \"400\";"
            + " show ID and passers, where passers is the SUM of Pass.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_14.json query multiple sorts", () => {
        const query = "In courses dataset courses grouped by UUID, find entries whose ID is \"400\";"
            + " show UUID and min, where min is the MIN of Average; "
            + "sort in descending order by min and UUID.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

    it("Should valid d2_17.json", () => {
        const query = "In courses dataset courses grouped by Department, "
            + "find entries whose Department is \"cpsc\"; show Department"
            + " and avgGrade, where avgGrade is the COUNT of Average.";
        const splitQuery: SplitQuery = new SplitGroupQuery(query);
        const parser: ValidateQuery = new ValidateQuery(splitQuery);
        expect(parser.valid_query(query)).to.equal(true);
    });

});

describe("Query Filter", () => {
    it("Should validate valid all query", () => {
        const q: QueryFilter = new QueryFilter(true);
        const expected: boolean = true;
        expect(q.validate_filter()).to.equal(true);
    });

    it("Should validate valid query", () => {
        const q: QueryFilter = new QueryFilter(false, "and", new MOP("Audit", "greater than", 45));
        const expected: boolean = true;
        expect(q.validate_filter()).to.equal(expected);
    });

    it("Should return false for invalid query (and or)", () => {
        const q: QueryFilter = new QueryFilter(false, "blue", new MOP("Audit", "greater than", 45));
        const expected: boolean = false;
        expect(q.validate_filter()).to.equal(expected);
    });

    it("Should return false invalid query: invalid MOP or SOP", () => {
        const q: QueryFilter = new QueryFilter(false, "and", new SOP("Purple", "Rain", "Prince"));
        const expected: boolean = false;
        expect(q.validate_filter()).to.equal(expected);
    });

});
