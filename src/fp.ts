import {
    Options,
    Path,
    getter as baseGetter,
    get as baseGet,
    parse,
} from '.'

// XXX pre-parsing the path would be nice (if it's a string), but we don't want
// to duplicate the logic/code inside the `getter` for determining the parser.
//
// for now, we only handle the (common) case where we're wrapping the default
// `get` export
const _get = (fn: typeof baseGet, path: Path, rest: [] | [any]) => {
    const parsed = ((fn === baseGet) && (typeof path === 'string'))
        ? parse(path)
        : path

    if (rest.length) {
        const [$$default] = rest

        return (obj: any, ...rest: [] | [any]) => {
            const $default = rest.length ? rest[0] : $$default
            return fn(obj, parsed, $default)
        }
    } else {
        return (obj: any, ...rest: [] | [any]) => {
            return fn(obj, parsed, ...rest)
        }
    }
}

const curry = (fn: typeof baseGet) => {
    return (path: Path, ...rest: [] | [any]) => _get(fn, path, rest)
}

const get = curry(baseGet)
const getter = (options: Options = {}) => curry(baseGetter(options))

export { get, getter }
