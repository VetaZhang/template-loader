interface IStateMap {
    [key: string]: symbol;
}
interface IProps {
    [key: string]: string | boolean;
}
interface INode {
    name: string;
    props: IProps;
    content: string;
    children: INode[];
    parent?: null | INode;
}
interface IParserConfig {
    funcName?: string;
    textTagName?: string[];
    formatValue?(val: string): string;
}
declare class Parser {
    str: string;
    index: number;
    char: string;
    stateMap: IStateMap;
    state: symbol;
    head: null | INode;
    current: null | INode;
    config: {
        funcName: string;
        textTagName: string[];
        formatValue(val: string): string;
    };
    constructor(config?: IParserConfig);
    nextChar(step?: number): string;
    prevChar(step?: number): string;
    lookNext(begin?: number, step?: number): string;
    createNewChild(): void;
    addToParent(): void;
    getResult(): INode | null;
    toString(obj: INode): string;
    throw(error: string): void;
    isNotTransChar(): boolean;
    isState(...state: string[]): boolean;
    setState(stateName: string): void;
    reset(): void;
    run(str: string): string;
    handleUselessChar(): void;
    handleChar(): void;
    handleNoteChar(): void;
    readContent(): void;
    readName(): void;
    readProps(): void;
    readKey(): string;
    readVal(): string;
    readValStr(startChar: string, endChar: string): string;
}
export default Parser;
