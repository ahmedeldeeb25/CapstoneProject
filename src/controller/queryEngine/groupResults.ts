
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
        const key: string = keys.join("-");
        const newData = data.slice();
        newData.map( (item: any) => {
            const arr: Array<string | number> = [];
            for (const k of keys) {
                arr.push(item[k]);
            }
            item[key] = arr;
        });
        return this.groupBy(key, data);
    }

    public groupBy(key: string, data: object[]
         = this.data): { [name: string]: Array<{ [name: string]: string | number }> } {
        return data.reduce( (result: any, item: any) => ({
            ...result,
            [item[key]]: [
                ...result[item[key]] || [],
                item,
            ],
        }),
        {});
    }

    public flattenData(data: { [index: string]: any }, shows: string[]): object[] {
        const result: object[] = [];
        for (const index of Object.keys(data)) {
            for (const show of shows) {
                result.push(data[index][0][show]);
            }
        }
        return result;
    }
}
