import * as http from "http";

export interface IGeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class Request {

    public async getCoords(url: string): Promise<{}> {
        // todo
        return new Promise( (resolve, reject) => {
            http.get(url, (res) => {
                const { statusCode } = res;
                const contentType = res.headers["content-type"];
                let error;
                if (statusCode !== 200) {
                    error = new Error("Request Failed. Status Code: ${statusCode}");
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error("Invalid content-type. Expected application/json but received ${contentType}");
                }
                if (error) {
                    res.resume();
                    throw new Error("an error occured");
                }
                res.setEncoding("utf8");
                let rawData: string = "";
                res.on("data", (chunk) => { rawData += chunk; });
                res.on("end", () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (err) {
                        reject(err);
                    }
                }).on("error", (err) => {
                    reject(err);
                });
            });
        });
    }
}
