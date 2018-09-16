// We need this to build our post string
import * as querystring from "querystring";
import * as http from "https";
import Log from "../Util";

export class PostCode {

    public postCode(codestring: string): void {
        // Build the post string from an object
        const postData = querystring.stringify({
            compilation_level: "ADVANCED_OPTIMIZATIONS",
            output_format: "json",
            output_info: "compiled_code",
            warning_level: "QUIET",
            result: codestring,
        });

        // An object of options to indicate where to post to
        const postOptions = {
            host: "agile-scrubland-17600.herokuapp.com",
            port: "443",
            path: "/add",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData),
            },
        };

        // Set up the request
        const postReq = http.request(postOptions, function (res) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                Log.test("Response: " + chunk);
            });
        });

        postReq.on("error", (error) => {
            Log.test(error + " error occurred!");
        });
        // post the data
        postReq.write(postData);
        postReq.end();

    }
}
