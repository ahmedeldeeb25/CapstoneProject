
export interface IQueryAST {
    name: string;
}

export interface IFilter {
    type: string;
    criteria: ICriteria[];
}

export interface ICriteria {
    type: string;
}

export default class QueryAST implements IQueryAST {
    public name: string;

    public get_name(): string {
        return this.name;
    }
}
