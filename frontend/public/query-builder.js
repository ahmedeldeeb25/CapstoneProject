/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = function() {
    let query = "";
    const activeForm = document.querySelector(".tab-panel.active").querySelector("form");
    const dataType = document.querySelector(".tab-panel.active").attributes.getNamedItem("data-type").value;
    const conditionType = activeForm.querySelector("input[name='conditionType']:checked").value;
    const rawFilters = activeForm.querySelectorAll(".control-group.condition");
    const rawTransformations = activeForm.querySelectorAll(".control-group.transformation");
    const rawOrders = activeForm.querySelector(".order").querySelector("select").querySelectorAll("option[selected='selected']");
    const direction = activeForm.querySelector(".descending").querySelector("input[checked='checked']");
    const connector = HelperFunctions.getConditionType(conditionType);
    const showCheckBoxes = activeForm.querySelector(".columns").querySelector(".control-group").children;
    const groupCheckBoxes = activeForm.querySelector(".groups").querySelector(".control-group").children;
    const transformations = HelperFunctions.getTransformations(rawTransformations);
    const show = HelperFunctions.getShowGroups("show", showCheckBoxes);
    const groups = HelperFunctions.getShowGroups("grouped by", groupCheckBoxes);
    const filters = HelperFunctions.getFilters(rawFilters, connector);
    const order = HelperFunctions.getOrder(rawOrders, direction);
    // DATATYPE
    if (dataType === "courses") {
        query += "In courses dataset courses";
    } else {
        query += "In rooms dataset rooms";
    }
    // GROUPED?
    if (groups) {
        query += " " + groups + ",";
    } else {
        query += ",";
    }
    // FILTERS
    if (filters) {
        // find entries whose
        query += " find entries whose " + filters + "; ";
    } else {
        // find all entries
        query += " find all entries; ";
    }
    // SHOW
    query += show;
    // TRANSFORMATIONS
    if (transformations) {
        query += transformations;
    }
    if (order) {
        query +=  "; " + order + ".";
    }  else {
        query += ".";
    }
    return query;
};

HelperFunctions =  {
    noneOfFollowing: false,
    sKeys: ["Department", "ID", "Instructor", "Title", "UUID",
        "FullName", "ShortName", "Number", "Name", "Address", "Type", "Furniture", "Link"],
    getConditionType: function(condition) {
        if (condition === "all") {
            this.noneOfFollowing = false;
            return "and";
        } else if (condition === "any" ){
            this.noneOfFollowing = false;
            return "or";
        } else {
            this.noneOfFollowing = true;
            return "and";
        }
    },
    invertFilters: function(filters) {
        return filters.map( (filter) => {
            if (filter.includes("not")) {
                filter = filter.replace(/not /g, "");
            } else {
                let breakPt = filter.indexOf("is") + 2;
                filter = filter.slice(0, breakPt) + " not" + filter.slice(breakPt);
            }
            return filter;
        });
    },
    getFilters: function(filters, condition){
        let allFilters = [];
        for (filter of filters) {
            let not = filter.querySelector(".not input:checked") ? " not" : "";
            let field = filter.querySelector(".fields").querySelector("select").value;
            field = this.translateColumn(field);
            let operator = filter.querySelector(".operators").querySelector("select").value;
            operator = this.translateOperator(operator, not);
            let term = filter.querySelector(".term").querySelector("input").value;
            if(this.sKeys.includes(field)) {
                term = `"${term}"`;
            }
            allFilters.push(field + " " + operator + " " + term);
        }
        if (this.noneOfFollowing) {
            allFilters = this.invertFilters(allFilters);
        }
        if (allFilters.length > 0) {
            return allFilters.join(" " + condition + " ");
        } else {
            return ""
        }
    },
    getTransformations(trans) {
        const shows = [];
        const transformations = [];
        for (tran of trans) {
            let term = tran.querySelector(".term").querySelector("input").value;
            let operator = tran.querySelector(".operators").querySelector("select").value;
            let field = tran.querySelector(".fields").querySelector("select").value;
            field = this.translateColumn(field);
            shows.push(term);
            transformations.push(term + " is the " + operator + " of " + field);
        }
        if (transformations.length > 0) {
            return " and " + shows.join(" and ") + ", where " + transformations.join(" and ");
        } else {
            return "";
        }
    },
    translateOperator: function(operator, not) {
        switch (operator) {
            case "EQ":
                return "is" + not  + " equal to";
            case "GT":
                return "is" + not + " greater than";
            case "IS":
                return "is" + not;
            case "LT":
                return "is" + not + " less than";
        }
    },
    translateColumn: function(col) {
        const dict = {
            "audit": "Audit",
            "avg": "Average",
            "dept": "Department",
            "fail": "Fail",
            "id": "ID",
            "instructor": "Instructor",
            "pass": "Pass",
            "title": "Title",
            "uuid": "UUID",
            "year": "Year",
            "address": "Address",
            "fullname": "Full Name",
            "furniture": "Furniture",
            "href": "Link",
            "lat": "Latitude",
            "lon": "Longitude",
            "name": "Name",
            "number": "Number",
            "seats": "Seats",
            "shortname": "Short Name",
            "type": "Type"
        }
        return dict[col];
    },
    getShowGroups: function(phrase, showCheckBoxes) {
        const show = [];
        for (box of showCheckBoxes) {
            const thisBox = box.querySelector("input");
            if (thisBox.checked) {
                show.push(this.translateColumn(thisBox.value));
            }
        }
        if (show.length === 0) {
            return "";
        } else {
            return phrase + " " + show.join(" and ");
        }
    },
    getOrder: function(orders, direction) {
        let dir = direction ? "descending" : "ascending";
        let phrase = "sort in " + dir + " order by ";
        let allOrders = [];
        for (order of orders) {
            allOrders.push(this.translateColumn(order.value));
        }
        if (allOrders.length > 0) {
            return phrase + allOrders.join(" and ");
        } else {
            return "";
        }
    },
    putItAllTogether: function(){
        return "todo";
    }
}
