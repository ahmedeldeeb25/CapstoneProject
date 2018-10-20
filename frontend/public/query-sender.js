/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = function(query) {
    return new Promise(function(fulfill, reject) {
        // TODO: implement!
        console.log("CampusExplorer.sendQuery not implemented yet.");
        query = "In courses dataset courses, find all entries; show ID.";
        const data = {
            body: JSON.stringify({ "query": query }),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }
        fetch("/query", data).then( (data) => {
            console.log(data);
            fulfill(data);
        }).catch( (err) => {
            console.log(err);
            reject(err);
        });
    });
};
