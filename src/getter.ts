import defaultParser from './parser'

export type Options = {
    default?: unknown,
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: (path: string) => Array<PropertyKey>;
};

export type Path = string | Array<PropertyKey>;

type Dict = Record<PropertyKey, any>;

// minification helpers
const { isArray } = Array
const $Object = Object
const $Symbol = Symbol

const NO_MAP = $Symbol()
const NO_FLAT_MAP = $Symbol()
const OPTIONS: Options = { flatMap: '*', map: '**' }

export const getter = (_options: Options = {}) => {
    const options = $Object.assign({}, OPTIONS, _options)
    const {
        default: $Default,
        flatMap: $flatMap,
        map: $map,
        parser: parse = defaultParser,
    } = options
    const flatMap = $flatMap === false ? NO_FLAT_MAP : $flatMap
    const map = $map === false ? NO_MAP : $map

    function get <D, O, T extends unknown>(obj: O, path: Path, $default: D): D | O | T | Array<D | T>
    function get <O, T extends unknown>(obj: O, path: Path): O | T | undefined | Array<T | undefined>
    function get (obj: any, path: Path, $default = $Default) {
        let props: Array<PropertyKey>

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

        const lastIndex = props.length - 1

        for (let i = 0; i <= lastIndex; ++i) {
            if (!obj) {
                return $default
            }

            const prop = props[i]
            const objIsArray = isArray(obj)

            if ((prop === flatMap) || (prop === map)) {
                // Object.values is very forgiving and works with anything that
                // can be turned into an object via Object(...), i.e. everything
                // but undefined and null, which we've guarded against above.
                const values = objIsArray ? obj : $Object.values(obj)

                if (i === lastIndex) {
                    return prop === flatMap ? values.flat() : values
                } else if (prop === flatMap) {
                    return values.flatMap(<V>(value: V) => {
                        return get(value, props.slice(i + 1), $default)
                    })
                } else {
                    return values.map(<V>(value: V) => {
                        return get(value, props.slice(i + 1), $default)
                    })
                }
            }

            if (objIsArray && Number.isInteger(<number>prop) && <number>prop < 0) {
                obj = obj[obj.length + <number>prop]
            } else {
                // XXX cast the symbol to a string to work around a TypeScript bug:
                // https://github.com/microsoft/TypeScript/issues/1863
                obj = (obj as Dict)[prop as string]
            }
        }

        return obj === undefined ? $default : obj
    }

    return get
}

export const get = getter()
