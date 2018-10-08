import * as http from "http";
import Log from "../../Util";

export interface IGeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class Request {
    private url: string = "http://sdmm.cs.ubc.ca:11316/api/v1/team_ccunnin8/";

    public async getCoords(address: string): Promise<{}> {
        // todo
        return new Promise((resolve, reject) => {
            try {
                http.get(this.url + address, (res) => {
                    const { statusCode } = res;
                    const contentType = res.headers["content-type"];
                    let error;
                    if (statusCode !== 200) {
                        error = new Error("Request Failed. Status Code: ${statusCode}");
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error("Invalid content-type." +
                            " Expected application / json but received ${ contentType }");
                    }
                    if (error) {
                        res.resume();
                        return resolve({
                            lat: 0,
                            lon: 0,
                        });
                    }
                    res.setEncoding("utf8");
                    let rawData: string = "";
                    res.on("data", (chunk) => { rawData += chunk; });
                    res.on("end", () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            return resolve(parsedData);
                        } catch (err) {
                            return resolve({ lat: 0, lon: 0 });
                        }
                    }).on("error", (err) => {
                        return resolve({ lat: 0, lon: 0 });
                    });
                    res.on("error", (err) => {
                        return resolve({ lat: 0, lon: 0 });
                    });
                });
            } catch (err) {
                return resolve({ lat: 0, lon: 0 });
            }
        });
    }
}
