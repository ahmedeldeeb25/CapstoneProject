export default abstract class CRITERIA {
    protected mOP: { [name: string]: (a: string | number, b: string | number) => boolean };
    private key: string;
    private OP: string;
    private target: number | string;
    private keys: string[];
    private phrases: string[];

    constructor(key: string, OP: string, target: number | string) {
        this.key = key;
        this.OP = OP;
        this.target = target;
    }

    public getKey(): string { return this.key; }

    public getOP(): string { return this.OP; }

    public getTarget(): number | string { return this.target; }

    public getKeys(): string[] { return this.keys; }

    public getPhrases(): string[] { return this.phrases; }
    public setKeys(keys: string[]) { this.keys = keys; }

    public setPhrases(phrases: string[]) { this.phrases = phrases; }

    public setKey(key: string) { this.key = key; }

    public validateCriteria(): boolean {
        return this.validateOP() && this.validateKey() && this.validateTarget();
    }

    public abstract getFunc(): (a: string | number, b: string | number) => boolean;

    public abstract validateOP(): boolean;

    public abstract validateKey(): boolean;

    public abstract validateTarget(): boolean;

}
