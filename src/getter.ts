import defaultParser from './parser'

export interface Collect {
    (value: {}): Array<unknown>;
    (value: {}, index: number): ArrayLike<unknown>;
}

export type Options = {
    collect?: Collect;
    default?: unknown;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: Options['split'];
    split?: string | Parser;
}

export type Parser = (path: string) => Array<PropertyKey>;
export type Path = PropertyKey | Array<PropertyKey>;

type Dict = Record<PropertyKey, unknown>;
type Getter = (options?: Options) => <T = any>(value: unknown, path: Path, $default?: unknown) => T;

// minification helpers
const { isArray: __isArray } = Array
const { defineProperty: __defineProperty, values: defaultCollect } = Object

const NO_MAP = Symbol()
const NO_FLAT_MAP = Symbol()

export const getter: Getter = (options: Options = {}) => {
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

    const toArray: Collect = (obj: {}, ...args: [] | [number]) => {
        // ignore this warning to avoid adding a redundant check to appease
        // TypeScript for something which works in JavaScript
        //
        //   > A spread argument must either have a tuple type or be passed to a
        //   > rest parameter.
        //
        // @ts-ignore
        return __isArray(obj) ? obj : collect(obj, ...args)
    }

    // XXX the name is important; if omitted, the `get` referenced in the body
    // of this function refers to the default `get` export defined at the bottom
    // of the file rather than this `get`, which may have different options
    function get (obj: unknown, path: Path, ...rest: unknown[]): any {
        const $default = rest.length ? rest[0] : $$default
        const coalesce = <T>(it: T) => it === undefined ? $default : it

        let props: ReadonlyArray<PropertyKey>

        if (__isArray(path)) {
            props = path
        } else {
            const type = path === null ? 'null' : typeof path

            if (type === 'string') {
                props = parse(path as string)
            } else if (type === 'number' || type === 'symbol') {
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
                const values = toArray(obj as {})

                let recurse

                if (i === lastIndex) {
                    recurse = coalesce // base case
                } else {
                    const tailProps = props.slice(i + 1)
                    recurse = <V>(value: V) => get(value, tailProps, $default)
                }

                return isFlatMap ? values.flatMap(recurse) : values.map(recurse)
            } else if (Number.isInteger(prop)) {
                const values = toArray(obj as {}, <number>prop)
                const index = <number>prop < 0
                    ? values.length + <number>prop
                    : <number>prop

                obj = values[index]
            } else {
                obj = (obj as Dict)[prop]
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
