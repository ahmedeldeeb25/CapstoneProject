import { expect } from "chai";
import Grouper from "../src/controller/queryEngine/groupResults";
import Aggregator from "../src/controller/queryAST/Aggregation";
import AggregateResults from "../src/controller/queryEngine/aggregateResults";
import InsightFacade from "../src/controller/InsightFacade";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

describe("Grouper", () => {
    let coursesData: object[];
    before("load data if it doesn't exist", async () => {
        // const filename = path.join(__dirname, "..", "/src/data/courses.zip");
        // const insightFacade = new InsightFacade();
        // try {
            // const buffer: Buffer = await (promisify)(fs.readFile)(filename);
            // const content: string = buffer.toString("base64");
            // await insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
            // coursesData = insightFacade.get_cache()["courses"];
            // coursesData = JSON.parse(await (promisify)(fs.readFile)("./courses.json", "utf-8"));
        // } catch (err) {
        //     throw new Error("there was an error loading data");
        // }
    });

    const data: object[] = [
        { rooms_name: "MCML_360E", rooms_fullname: "MacMillan",
        rooms_shortname: "MCML", rooms_seats: 8, rooms_furniture:
        "Classroom-Moveable Tables + Chairs", rooms_href:
        "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360E",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall",
        rooms_lat: -123.25027, rooms_number: "360E" },
        { rooms_name: "MCML_360F", rooms_fullname: "MacMillan", rooms_shortname:
        "MCML", rooms_seats: 8, rooms_furniture: "Classroom-Moveable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360F",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027,
        rooms_number: "360F" }, { rooms_name: "MCML_360G", rooms_fullname: "MacMillan", rooms_shortname:
        "MCML", rooms_seats: 8, rooms_furniture: "Classroom-Moveable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360G",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027, rooms_number: "360G" },
        { rooms_name: "MCML_360H", rooms_fullname: "MacMillan", rooms_shortname: "MCML", rooms_seats: 8,
        rooms_furniture: "Classroom-Moveable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360H",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027, rooms_number: "360H" },
        { rooms_name: "MCML_360J", rooms_fullname: "MacMillan", rooms_shortname: "MCML", rooms_seats: 8,
        rooms_furniture: "Classroom-Moveable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360J",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027, rooms_number: "360J" },
        { rooms_name: "MCML_360K", rooms_fullname: "MacMillan", rooms_shortname: "MCML", rooms_seats: 8,
        rooms_furniture: "Classroom-Moveable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360K",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027, rooms_number: "360K" },
        { rooms_name: "MCML_360L", rooms_fullname: "MacMillan", rooms_shortname: "MCML", rooms_seats: 8,
        rooms_furniture: "Classroom-Moveable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360L",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027, rooms_number: "360L" },
        { rooms_name: "MCML_360M", rooms_fullname: "MacMillan", rooms_shortname: "MCML", rooms_seats: 8,
        rooms_furniture: "Classroom-Movable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360M",
        rooms_type: "Small Group", rooms_address: "2357 Main Mall", rooms_lat: -123.25027, rooms_number: "360M" },
        { rooms_name: "MATH_100", rooms_fullname: "Mathematics", rooms_shortname: "MATH", rooms_seats: 224,
        rooms_furniture: "Classroom-Fixed Tablets",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-100",
        rooms_type: "Tiered Large Group", rooms_address: "1984 Mathematics Road", rooms_lat: -123.255534,
        rooms_number: "100" }, { rooms_name: "MATH_102", rooms_fullname: "Mathematics", rooms_shortname: "MATH",
        rooms_seats: 60, rooms_furniture: "Classroom-Movable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-102",
        rooms_type: "Small Group", rooms_address: "1984 Mathematics Road", rooms_lat: -123.255534,
        rooms_number: "102" }, { rooms_name: "MATH_104", rooms_fullname: "Mathematics", rooms_shortname: "MATH",
        rooms_seats: 48, rooms_furniture: "Classroom-Movable Tables + Chairs",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-104",
        rooms_type: "Open Design General Purpose", rooms_address: "1984 Mathematics Road", rooms_lat: -123.255534,
        rooms_number: "104" }, { rooms_name: "MATH_105", rooms_fullname: "Mathematics", rooms_shortname:
        "MATH", rooms_seats: 30, rooms_furniture: "Classroom-Movable Tablets",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-105",
        rooms_type: "Open Design General Purpose", rooms_address: "1984 Mathematics Road", rooms_lat: -123.255534,
        rooms_number: "105" }, { rooms_name: "MATH_202", rooms_fullname: "Mathematics", rooms_shortname: "MATH",
        rooms_seats: 30, rooms_furniture: "Classroom-Movable Tablets",
        rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-202",
        rooms_type: "Small Group", rooms_address: "1984 Mathematics Road",
        rooms_lat: -123.255534, rooms_number: "202" },
    ];

    it("Should group data 1 deep", () => {
        const groups: string[] = ["rooms_type"];
        const grouper = new Grouper(data);
        // Log.test(inspect(grouper.groupBy(groups[0])));
        expect(Object.keys(grouper.groupData(groups)).length).to.equal(3);
    });

    it("Should group data multiple deep", () => {
        const groups: string[] = ["rooms_name", "rooms_seats"];
        const grouper = new Grouper(data);
        // Log.test(inspect(grouper.groupData(groups)));
    });

    it("Should aggregate groups", () => {
        const agg1 = new Aggregator("avg", "AVG", "rooms_seats");
        const agg2 = new Aggregator("countName", "COUNT", "rooms_name");
        const show: string[] = ["rooms_seats", "rooms_name", "rooms_fullname"];
        const groups: string[] = ["rooms_name", "rooms_seast"];
        const grouper: Grouper = new Grouper(data);
        const grouped: any = grouper.groupData(groups);
        const aggregator: AggregateResults = new AggregateResults([agg1, agg2], show);
        // Log.test(inspect(aggregator.aggregate(grouped)));
    });

    // it("Should group data in a timely manner", () => {
    //     const grouper = new Grouper(data);
    //     const results: {} = grouper.groupData(["courses_id"], coursesData);
    //     // Log.test(inspect(results));
    // });

    // it("Should group data in a timely manner", () => {
    //     const grouper = new Grouper(data);
    //     const results: {} = grouper.groupData(["courses_id", "courses_title"], coursesData);
    //     // Log.test(inspect(results));
    // });
});
