export type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: (path: string) => Array<PropertyKey>;
};

export type Path = PropertyKey | Array<PropertyKey>;

export const get: (obj: any, path: Path, $default?: any) => any;
export const getter: (options?: Options) => typeof get;
export const parser: (path: string) => Array<PropertyKey>;
