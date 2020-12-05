import {
    get as baseGet,
    getter as baseGetter,
    Options,
    Parser,
    Path
} from '.'

type Get = typeof baseGet;
type GetWithParse = Get & { parse: Parser };

const _get = (fn: Get, path: Path, rest: [] | [any]) => {
    const parsed = typeof path === 'string'
        ? (fn as GetWithParse).parse(path)
        : path

    if (rest.length) {
        const [$$default] = rest

        return (obj: any, ...rest: [] | [any]): unknown => {
            const $default = rest.length ? rest[0] : $$default
            return fn(obj, parsed, $default)
        }
    } else {
        return (obj: any, ...rest: [] | [any]): unknown => {
            return fn(obj, parsed, ...rest)
        }
    }
}

const curry = (fn: Get) => {
    return (path: Path, ...rest: [] | [any]) => _get(fn, path, rest)
}

const get = curry(baseGet)
const getter = (options: Options = {}) => curry(baseGetter(options))

export { get, getter }
