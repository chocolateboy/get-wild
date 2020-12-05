declare type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: Options['split'];
    split?: string | Parser;
};
declare type Parser = (path: string) => Array<PropertyKey>;
declare type Path = PropertyKey | Array<PropertyKey>;

declare const get: (path: Path, ...rest: [] | [any]) => (obj: any, ...rest: [] | [any]) => unknown;
declare const getter: (options?: Options) => (path: Path, ...rest: [] | [any]) => (obj: any, ...rest: [] | [any]) => unknown;

export { get, getter };
