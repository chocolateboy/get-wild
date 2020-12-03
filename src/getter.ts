import defaultParser from './parser'

export type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: Options['split'];
    split?: string | ((path: string) => Array<PropertyKey>);
};

export type Path = PropertyKey | Array<PropertyKey>;

type Dict = Record<PropertyKey, any>;

// minification helpers
const { isArray } = Array
const $Object = Object
const $Symbol = Symbol

const NO_MAP = $Symbol()
const NO_FLAT_MAP = $Symbol()

export const getter = (options: Options = {}) => {
    const {
        collect = $Object.values,
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
    return function get (obj: any, path: Path, ...rest: [] | [any]): unknown {
        let props: ReadonlyArray<PropertyKey>

        switch (typeof path) {
            case 'string':
                props = parse(path)
                break

            case 'number':
            case 'symbol':
                props = [path]
                break

            default:
                if (isArray(path)) {
                    props = path
                } else {
                    throw new TypeError('Invalid path: expected a string, array, number, or symbol')
                }
        }

        const $default = rest.length ? rest[0] : $$default
        const lastIndex = props.length - 1

        for (let i = 0; i <= lastIndex; ++i) {
            if (!obj) {
                return $default
            }

            const prop = props[i]

            if ((prop === flatMap) || (prop === map)) {
                // Object.values is very forgiving and works with anything that
                // can be turned into an object via Object(...), i.e. everything
                // but undefined and null, which we've guarded against above.
                const values = isArray(obj) ? obj : collect(obj)

                if (i === lastIndex) {
                    return prop === flatMap ? values.flat() : values
                }

                const newProps = props.slice(i + 1)

                if (prop === flatMap) {
                    return values.flatMap(<V>(value: V) => {
                        return get(value, newProps, $default)
                    })
                } else {
                    return values.map(<V>(value: V) => {
                        return get(value, newProps, $default)
                    })
                }
            }

            if (isArray(obj) && Number.isInteger(<number>prop) && <number>prop < 0) {
                obj = obj[obj.length + <number>prop]
            } else {
                // XXX cast the symbol to a string to work around a TypeScript bug:
                // https://github.com/microsoft/TypeScript/issues/1863
                obj = (obj as Dict)[prop as string]
            }
        }

        return obj === undefined ? $default : obj
    }
}

export const get = getter()
