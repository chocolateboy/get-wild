const test = require('ava')

const {
    get,
    getter,
    parser: defaultParser,
    split: defaultSplit
} = require('..')

require('array-flat-polyfill') // for Node v10

function node (key, value) {
    return { foo: { bar: { [key]: value } } }
}

const DEEP_JSON = require('./fixtures/deep.json')
const DEEP_SETS = require('./fixtures/deep.js')
const SYMBOL = Symbol('symbol')
const NODE = node('baz', 'quux')

const ARRAY = [
    [{ value: 1 }, { value: 2 }, { value: 3 }],
    [{ value: 4, }, { value: 5, }, { value: 6 }],
    [{ value: 7, }, { value: 8, }, { value: 9 }],
]

const TREE = {
    '': 'empty',
    [SYMBOL]: SYMBOL,

    nodes: {
        alpha: node('baz', 'quux1'),
        beta: node('fizz', 'buzz'),
        gamma: node('baz', 'quux2'),
        delta: node('buzz', 'fizz'),
    }
}

test('array indices', t => {
    t.is(get(ARRAY, 1), ARRAY[1])
    t.is(get(ARRAY, -1), ARRAY[2])

    t.deepEqual(get(ARRAY, '[0][2]'), { value: 3 })
    t.deepEqual(get(ARRAY, [0, 2]), { value: 3 })
    t.deepEqual(get(ARRAY, '[1][-1]'), { value: 6 })
    t.deepEqual(get(ARRAY, [1, -1]), { value: 6 })
    t.deepEqual(get(ARRAY, '[-1][1]'), { value: 8 })
    t.deepEqual(get(ARRAY, [-1, 1]), { value: 8 })

    t.deepEqual(get(ARRAY, '0.2'), { value: 3 })
    t.deepEqual(get(ARRAY, '0.2', 42), { value: 3 })
    t.deepEqual(get(ARRAY, '1.-1'), undefined)
    t.deepEqual(get(ARRAY, '1.-1', 42), 42)
    t.deepEqual(get(ARRAY, '-1.1'), undefined)
    t.deepEqual(get(ARRAY, '-1.1', 42), 42)
})

test('bracket', t => {
    const obj1 = node('a.b.c', 'd')
    const obj2 = node('[42]', 42)

    t.deepEqual(get(obj1, 'foo.bar["a.b.c"]'), 'd')
    t.deepEqual(get(obj1, 'foo.bar.a.b.c'), undefined)
    t.deepEqual(get(obj1, 'foo.bar.a.b.c', 42), 42)

    t.deepEqual(get(obj2, 'foo.bar["[42]"]'), 42)
    t.deepEqual(get(obj2, 'foo.bar[42]'), undefined)
    t.deepEqual(get(obj2, 'foo.bar[42]', 42), 42)
})

test('default options', t => {
    const falsies = [null, undefined, false, '', 0, NaN]
    const path = 'foo.bar.baz'

    for (const value of falsies) {
        t.deepEqual(get(value, path), undefined)
        t.deepEqual(get(value, path, 42), 42)

        const obj = node('baz', value)

        t.deepEqual(get(obj, path), value)

        if (value === undefined) {
            t.deepEqual(get(obj, path, 42), 42)
        } else {
            t.deepEqual(get(obj, path, 42), value)
        }

        t.deepEqual(get(obj, `${path}.quux`), undefined)
        t.deepEqual(get(obj, `${path}.quux`, 42), 42)
    }
})

test('error', t => {
    for (const path of [{}, escape, /foo/]) {
        t.throws(
            () => get(NODE, path),
            {
                instanceOf: TypeError,
                message: /\bInvalid path\b/,
            }
        )
    }
})

test('export.parser', t => {
    const wrapper = path => defaultParser(path).reverse()
    const get = getter({ parser: wrapper })
    const obj = { foo: { bar: { baz: 'quux' } } }

    t.is(get(obj, 'baz.bar.foo'), 'quux')
})

test('export.split', t => {
    const wrapper = path => defaultSplit(path).reverse()
    const get = getter({ split: wrapper })
    const obj = { foo: { bar: { baz: 'quux' } } }

    t.is(get(obj, 'baz.bar.foo'), 'quux')
})

test('option.collect', t => {
    // example from the README

    const want = ['foo', 'bar', 'baz', 'quux']

    const collect = value => {
        if (value instanceof Map || value instanceof Set) {
            return Array.from(value.values())
        } else {
            return Object.values(value)
        }
    }

    const obj = {
        1: { value: 'foo' },
        2: { value: 'bar' },
        3: { value: 'baz' },
        4: { value: 'quux' },
    }

    const map = new Map([
        [1, { value: 'foo' }],
        [2, { value: 'bar' }],
        [3, { value: 'baz' }],
        [4, { value: 'quux' }],
    ])

    const set = new Set([
        { value: 'foo' },
        { value: 'bar' },
        { value: 'baz' },
        { value: 'quux' },
    ])

    const object = { obj, map, set }
    const get = getter({ collect })

    t.deepEqual(get(object, 'obj.*.value'), want)
    t.deepEqual(get(object, 'map.*.value'), want)
    t.deepEqual(get(object, 'set.*.value'), want)
})

test('option.default', t => {
    const path = 'nodes.*.foo.bar.baz'
    const get1 = getter({ default: undefined })
    const get2 = getter({ default: 42 })
    const get3 = getter({ default: [] })

    t.deepEqual(get1(TREE, path), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get1(TREE, path, 'override'), [
        'quux1',
        'override',
        'quux2',
        'override',
    ])

    t.deepEqual(get2(TREE, path), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get2(TREE, path, 'override'), [
        'quux1',
        'override',
        'quux2',
        'override',
    ])

    t.deepEqual(get3(TREE, path), [
        'quux1',
        'quux2',
    ])

    t.deepEqual(get3(TREE, path, 'override'), [
        'quux1',
        'override',
        'quux2',
        'override',
    ])

    t.deepEqual(get3(TREE, 'nodes.**.foo.bar.baz'), [
        'quux1',
        [],
        'quux2',
        [],
    ])
})

test('option.flatMap', t => {
    const get1 = getter({ flatMap: '*', map: false })
    const get2 = getter({ flatMap: SYMBOL, map: false })
    const path = ['nodes', SYMBOL, 'foo', 'bar', 'baz']

    t.deepEqual(get(TREE, 'nodes.**.foo.bar.baz'), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get(TREE, 'nodes.**.foo.bar.baz', 42), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get(TREE, 'nodes.*.foo.bar.baz', []), [
        'quux1',
        'quux2',
    ])

    t.deepEqual(get1(TREE, 'nodes.*.foo.bar.baz'), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get1(TREE, 'nodes.*.foo.bar.baz', 42), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get1(TREE, 'nodes.*.foo.bar.baz', []), [
        'quux1',
        'quux2',
    ])

    t.deepEqual(get2(TREE, path), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get2(TREE, path, 42), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get2(TREE, path, []), [
        'quux1',
        'quux2',
    ])
})

test('option.flatMap = false', t => {
    const obj = node('*', 'quux')
    const get = getter({ flatMap: false })

    t.deepEqual(get(obj, 'foo.*.baz.quux'), undefined)
    t.deepEqual(get(obj, ['foo', '*', 'baz', 'quux']), undefined)
    t.deepEqual(get(obj, 'foo.*.baz.quux', 42), 42)
    t.deepEqual(get(obj, ['foo', '*', 'baz', 'quux'], 42), 42)
    t.deepEqual(get(obj, 'foo.bar.*'), 'quux')
    t.deepEqual(get(obj, ['foo', 'bar', '*']), 'quux')
})

test('option.parser', t => {
    const parser = path => path.split('.')
    const get1 = getter({ parser })
    const get2 = getter({ parser: '.' })
    const obj = { '': { '': 42 } }

    t.is(get1(obj, '.'), 42)
    t.is(get2(obj, '.'), 42)
})

test('option.split', t => {
    const split = path => path.split('.')
    const get1 = getter({ split })
    const get2 = getter({ split: '.' })
    const obj = { '': { '': 42 } }

    t.is(get1(obj, '.'), 42)
    t.is(get2(obj, '.'), 42)
})

test('option.map', t => {
    const get1 = getter({ map: '**', flatMap: false })
    const get2 = getter({ map: SYMBOL, flatMap: false })
    const path = ['nodes', SYMBOL, 'foo', 'bar', 'baz']

    t.deepEqual(get(TREE, 'nodes.*.foo.bar.baz'), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get(TREE, 'nodes.*.foo.bar.baz', 42), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get(TREE, 'nodes.**.foo.bar.baz', []), [
        'quux1',
        [],
        'quux2',
        [],
    ])

    t.deepEqual(get1(TREE, 'nodes.**.foo.bar.baz'), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get1(TREE, 'nodes.**.foo.bar.baz', 42), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get1(TREE, 'nodes.**.foo.bar.baz', []), [
        'quux1',
        [],
        'quux2',
        [],
    ])

    t.deepEqual(get2(TREE, path), [
        'quux1',
        undefined,
        'quux2',
        undefined,
    ])

    t.deepEqual(get2(TREE, path, 42), [
        'quux1',
        42,
        'quux2',
        42,
    ])

    t.deepEqual(get2(TREE, path, []), [
        'quux1',
        [],
        'quux2',
        [],
    ])
})

test('option.map = false', t => {
    const obj = node('**', 'quux')
    const get = getter({ map: false })

    t.deepEqual(get(obj, 'foo.**.baz.quux'), undefined)
    t.deepEqual(get(obj, ['foo', '**', 'baz', 'quux']), undefined)
    t.deepEqual(get(obj, 'foo.**.baz.quux', 42), 42)
    t.deepEqual(get(obj, ['foo', '**', 'baz', 'quux'], 42), 42)
    t.deepEqual(get(obj, 'foo.bar.**'), 'quux')
    t.deepEqual(get(obj, ['foo', 'bar', '**']), 'quux')
})

test('path', t => {
    const s = Symbol()
    const array = ['foo', 'bar', 'baz']
    const obj = { [s]: 42, baz: 'quux' }

    t.deepEqual(get(array, 0), 'foo')
    t.deepEqual(get(array, [0]), 'foo')
    t.deepEqual(get(array, -1), 'baz')
    t.deepEqual(get(array, [-1]), 'baz')

    t.deepEqual(get(obj, s), 42)
    t.deepEqual(get(obj, [s]), 42)
    t.deepEqual(get(obj, 'baz'), 'quux')
    t.deepEqual(get(obj, ['baz']), 'quux')
})

test('scalar', t => {
    t.deepEqual(get(NODE, []), NODE)
    t.deepEqual(get(NODE, 'no-such-key'), undefined)
    t.deepEqual(get(NODE, ['no-such-key']), undefined)
    t.deepEqual(get(NODE, 'no-such-key', 42), 42)
    t.deepEqual(get(NODE, ['no-such-key'], 42), 42)
    t.deepEqual(get(NODE, 'foo'), { bar: { baz: 'quux' } })
    t.deepEqual(get(NODE, ['foo']), { bar: { baz: 'quux' } })
    t.deepEqual(get(NODE, 'foo.bar'), { baz: 'quux' })
    t.deepEqual(get(NODE, ['foo', 'bar']), { baz: 'quux' })
    t.deepEqual(get(NODE, 'foo.bar.baz'), 'quux')
    t.deepEqual(get(NODE, ['foo', 'bar', 'baz']), 'quux')

    t.deepEqual(get(TREE, '[""]'), 'empty')
    t.deepEqual(get(TREE, ['']), 'empty')
    t.deepEqual(get(TREE, SYMBOL), SYMBOL)
    t.deepEqual(get(TREE, [SYMBOL]), SYMBOL)
})

test('wildcards', t => {
    // confirm the example in the README works i.e. the wildcard extracts array
    // values
    t.deepEqual(get(ARRAY, '[1].*.value'), [4, 5, 6])

    // leading and trailing wildcards
    const obj = {
        a: { value: { foo: 'bar' } },
        b: { value: { bar: 'baz' } },
        c: { value: { baz: 'quux' } }
    }

    t.deepEqual(get(obj, '**.value.**'), [['bar'], ['baz'], ['quux']])
    t.deepEqual(get(obj, '*.value.*'), ['bar', 'baz', 'quux'])

    const arr = [
        { a: 'foo', b: undefined, c: 'bar' },
        { d: 'baz', e: undefined, f: 'quux' },
    ]

    // although written + read from left to right (which locates the
    // terminals/leaves), the logic is best thought of (and implemented as — via
    // recursion) a *pipeline* which takes leaves on the rhs and passes them up
    // through the transformations to their left.
    //
    // a wildcard match always returns an array, so each rhs operation passes an
    // array to the lhs and the lhs decides what to do with it (flatten it or
    // return it verbatim)

    // 1) do whatever the rhs says on each object then flatten the resulting
    // arrays
    t.deepEqual(get(arr, '*.*'), ['foo', undefined, 'bar', 'baz', undefined, 'quux'])
    t.deepEqual(get(arr, '*.*', []), ['foo', 'bar', 'baz', 'quux'])
    t.deepEqual(get(arr, '*.**'), ['foo', undefined, 'bar', 'baz', undefined, 'quux'])
    t.deepEqual(get(arr, '*.**', []), ['foo', [], 'bar', 'baz', [], 'quux'])

    // 2) do whatever the rhs says on each object and return the resulting
    // arrays verbatim
    t.deepEqual(get(arr, '**.*'), [['foo', undefined, 'bar'], ['baz', undefined, 'quux' ]])
    t.deepEqual(get(arr, '**.*', []), [['foo', 'bar'], ['baz', 'quux']])
    t.deepEqual(get(arr, '**.**'), [['foo', undefined, 'bar'], ['baz', undefined, 'quux']])
    t.deepEqual(get(arr, '**.**', []), [['foo', [], 'bar'], ['baz', [], 'quux']])
})

test('leading wildcards', t => {
    const arr = [{ value: 'foo' }, {}, { value: 'baz' }]
    const obj = { a: { value: 'foo' }, b: {}, c: { value: 'baz' } }

    t.deepEqual(get(arr, '*.value'), ['foo', undefined, 'baz'])
    t.deepEqual(get(arr, '*.value', []), ['foo', 'baz'])
    t.deepEqual(get(arr, '**.value'), ['foo', undefined, 'baz'])
    t.deepEqual(get(arr, '**.value', []), ['foo', [], 'baz'])

    t.deepEqual(get(obj, '*.value'), ['foo', undefined, 'baz'])
    t.deepEqual(get(obj, '*.value', []), ['foo', 'baz'])
    t.deepEqual(get(obj, '**.value'), ['foo', undefined, 'baz'])
    t.deepEqual(get(obj, '**.value', []), ['foo', [], 'baz'])
})

test('trailing wildcards', t => {
    const obj = { root: { a: 'foo', b: undefined, c: 'baz' } }
    const tree = node('baz', ARRAY)

    /*
     * tree:
     *
     * {
     *     "foo": {
     *         "bar": {
     *             "baz": [
     *                 [{ "value": 1 }, { "value": 2 }, { "value": 3 }],
     *                 [{ "value": 4 }, { "value": 5 }, { "value": 6 }],
     *                 [{ "value": 7 }, { "value": 8 }, { "value": 9 }]
     *             ]
     *         }
     *     }
     * }
     */

    t.deepEqual(get(obj, 'root.*'), ['foo', undefined, 'baz'])
    t.deepEqual(get(obj, 'root.*', []), ['foo', 'baz'])
    t.deepEqual(get(obj, 'root.**'), ['foo', undefined, 'baz'])
    t.deepEqual(get(obj, 'root.**', []), ['foo', [], 'baz'])

    t.deepEqual(get(tree, 'foo.bar.baz.*'), ARRAY.flat())
    t.deepEqual(get(tree, 'foo.bar.baz.**'), ARRAY)
})

// XXX the tests above don't involve deeply nested objects, which hid a bug
// (recursive `get` calls were made to the default `get` rather than the
// customized `get`). this object isn't deep by real-world standards but it's
// deep enough to verify that the bug has been fixed

test('recursion', t => {
    const path1 = 'a.*.b.*.c.*.d.*.e.*.f.*.g'
    const path2 = 'a.+.b.+.c.+.d.+.e.+.f.+.g'
    const path3 = 'a.[].b.[].c.[].d.[].e.[].f.[].g'

    const get1 = getter()
    const get2 = getter({ flatMap: '+' })
    const get3 = getter({ map: '[]', split: '.' })

    t.snapshot(get(DEEP_JSON, path1), 'default-flat-map (1)')
    t.snapshot(get1(DEEP_JSON, path1), 'default-flat-map (2)')
    t.snapshot(get2(DEEP_JSON, path2), 'custom-flat-map')
    t.snapshot(get3(DEEP_JSON, path3), 'custom-map')

    let count = 0

    // traverse a tree of Sets rather than the JSON tree because arrays are
    // handled without calling `collect`
    const collect = value => {
        ++count
        return Array.from(value.values()).reverse()
    }

    const get4 = getter({ collect })

    t.snapshot(get4(DEEP_SETS, path1), 'custom-collect')
    t.is(count, 63)
})
