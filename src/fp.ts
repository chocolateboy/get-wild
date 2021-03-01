import {
    get as baseGet,
    getter as baseGetter,
    Options,
    Parser,
    Path
} from '.'

type BaseGet = typeof baseGet;
type Get = (path: Path, $default?: any) => (value: any, $default?: any) => any;
type GetWithParse = BaseGet & { parse: Parser };
type Pluck = (path: Path, $default?: any) => (value: any) => any;

const parse = (path: Path, get: BaseGet) => {
    return typeof path === 'string' ? (get as GetWithParse).parse(path) : path
}

const _get = (get: BaseGet, $$$default?: any): Get => {
    return (_path, ...rest) => {
        const path = parse(_path, get)
        const $$default = rest.length ? rest[0] : $$$default

        return (value, ...rest) => {
            const $default = rest.length ? rest[0] : $$default
            return get(value, path, $default)
        }
    }
}

const _pluck = (get: BaseGet, $$default?: any): Pluck => {
    return (_path, ...rest) => {
        const path = parse(_path, get)
        const $default = rest.length ? rest[0] : $$default
        return value => get(value, path, $default)
    }
}

const get = _get(baseGet)
const pluck = _pluck(baseGet)
const getter = (options: Options = {}) => _get(baseGetter(options), options.default)
const plucker = (options: Options = {}) => _pluck(baseGetter(options), options.default)

export { get, getter, pluck, plucker }
