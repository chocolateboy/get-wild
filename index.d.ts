export type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: (path: string) => ReadonlyArray<PropertyKey>;
};

export type Path = string | ReadonlyArray<PropertyKey>;

export const get: <O>(obj: O, path: Path, $default?: any) => any;
export const getter: (options?: Options) => typeof get;
export const parser: (path: string) => Array<PropertyKey>;
