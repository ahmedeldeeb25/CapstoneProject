export default class Order {
    private key: string;
    private phrase: string = "sort in ascending order by";
    private order: string;
    private keys: string[] = ["Average", "Pass", "Fail", "Audit", "Department", "ID", "Instructor", "Title", "UUID"];
    constructor(order: string) {
        this.order = order.trim();
        this.parse(order);
    }
    public getKey(): string { return this.key; }

    public validateOrder(): boolean {
        return this.keys.includes(this.key)
            && this.order.split(" ").length === 6
            && /^sort in ascending order by/.test(this.order);
    }

    public toString(): string {
        return `key: ${this.key}`;
    }

    private parse(order: string) {
        const words: string[] = order.split(" ");
        const key: string = words.pop();
        this.key = key;
    }

}
