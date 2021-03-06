import defaultParser from './parser'

export type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: Options['split'];
    split?: string | Parser;
};

export type Parser = (path: string) => Array<PropertyKey>;
export type Path = PropertyKey | Array<PropertyKey>;

type Dict = Record<PropertyKey, any>;

// minification helpers
const { isArray: __isArray } = Array
const { defineProperty: __defineProperty, values: defaultCollect } = Object

const NO_MAP = Symbol()
const NO_FLAT_MAP = Symbol()

export const getter = (options: Options = {}): typeof get => {
    const {
        collect = defaultCollect,
        default: $$default,
        flatMap: $flatMap = '*',
        map: $map = '**',
        parser = defaultParser,
        split = parser,
    } = options

    const flatMap = $flatMap === false ? NO_FLAT_MAP : $flatMap
    const map = $map === false ? NO_MAP : $map
    const parse = typeof split === 'string'
        ? (path: string) => path.split(split)
        : split

    // XXX the name is important; if omitted, `get` refers to the default `get`
    // export defined at the bottom of the file rather than this `get`, which
    // may have different options
    function get (obj: any, path: Path, ...rest: [] | [any]): any {
        const $default = rest.length ? rest[0] : $$default
        const coalesce = <T>(it: T) => it === undefined ? $default : it

        let props: ReadonlyArray<PropertyKey>

        if (__isArray(path)) {
            props = path
        } else {
            const type = path === null ? 'null' : typeof path

            if (type == 'string') {
                props = parse(path as string)
            } else if (type == 'number' || type == 'symbol') {
                props = [path]
            } else {
                throw new TypeError(`Invalid path: expected a string, array, number, or symbol, got: ${type}`)
            }
        }

        const lastIndex = props.length - 1

        for (let i = 0; i <= lastIndex; ++i) {
            if (!obj) {
                return $default
            }

            const prop = props[i]
            const isFlatMap = prop === flatMap

            if (isFlatMap || prop === map) {
                const values = __isArray(obj) ? obj : collect(obj)

                let recurse

                if (i === lastIndex) {
                    recurse = coalesce // base case
                } else {
                    const newProps = props.slice(i + 1)
                    recurse = <V>(value: V) => get(value, newProps, $default)
                }

                return isFlatMap ? values.flatMap(recurse) : values.map(recurse)
            } else if (Number.isInteger(<number>prop) && __isArray(obj)) {
                obj = obj[<number>prop < 0 ? obj.length + <number>prop : <number>prop]
            } else {
                // XXX cast the symbol to a string to work around a TypeScript bug:
                // https://github.com/microsoft/TypeScript/issues/1863
                obj = (obj as Dict)[prop as string]
            }
        }

        return coalesce(obj)
    }

    // expose the supplied/generated parser as a (read-only) property on the
    // function. this is for the currying wrappers and isn't exposed by the
    // curried functions
    return __defineProperty(get, 'parse', { value: parse })
}

export const get = getter()
