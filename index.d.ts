declare type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: Options['split'];
    split?: string | ((path: string) => Array<PropertyKey>);
};
declare type Path = PropertyKey | Array<PropertyKey>;
declare const getter: (options?: Options) => (obj: any, path: Path, $default?: any) => any;
declare const get: (obj: any, path: Path, $default?: any) => any;

declare const parser: (path: string) => (string | number)[];

export { Options, Path, get, getter, parser, parser as split };
