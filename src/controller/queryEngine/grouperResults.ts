
export default class Grouper {

    private data: object[];

    constructor(data: object[]) {
        this.data = data;
    }

    public get_data(): object[] { return this.data; }

    // Groups Together Keys To Group On So that it's not nested
    // Assummes that the keys being passed in have already been reformatted
    // ie Seats -> rooms_seats
    public groupData(keys: string[], data: object[] = this.data): object[] {
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

    public groupBy(key: string, data: object[] = this.data): object[] {
        return data.reduce( (result: any, item: any) => ({
            ...result,
            [item[key]]: [
                ...result[item[key]] || [],
                item,
            ],
        }),
        {});
    }
}
