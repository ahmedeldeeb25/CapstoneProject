
export default class Grouper {

    private data: object[];

    constructor(data: object[]) {
        this.data = data.slice();
    }

    public get_data(): object[] { return this.data; }

    // Groups Together Keys To Group On So that it's not nested
    // Assummes that the keys being passed in have already been reformatted
    // ie Seats -> rooms_seats
    public groupData(keys: string[], data: object[]
         = this.data): { [name: string]: Array<{ [name: string]: string | number}> } {
        const newData: { [name: string]: Array<{ [name: string]: string | number }> } = {};
        for (const d of data as any) {
            // get all the values that respond to each key and make it a new key
            const val: Array<string | number> = [];
            for (const k of keys) {
                val.push(d[k]);
            }
            const newKey: string = val.join("-");
            if (newData[newKey]) {
                newData[newKey].push(d);
            } else {
                newData[newKey] = [d];
            }
        }
        return newData;
        // return this.groupBy(key, data);
    }

}
