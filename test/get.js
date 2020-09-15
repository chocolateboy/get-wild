const test            = require('ava')
const { get, getter } = require('..')

require('array-flat-polyfill') // for Node v10

function node (key, value) {
    return { foo: { bar: { [key]: value } } }
}

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

test('default', t => {
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

test('map', t => {
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

test('flatMap', t => {
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

test('trailing wildcards', t => {
    const tree = node('baz', ARRAY)

    t.deepEqual(get(tree, 'foo.bar.baz.*'), ARRAY.flat())
    t.deepEqual(get(tree, 'foo.bar.baz.**'), ARRAY)
})

// generic wildcard tests where we don't care about the flatMap/map distinction
test('wildcard', t => {
    // confirm the example in the README works i.e. the wildcard extracts array
    // values
    t.deepEqual(get(ARRAY, '[1].*.value'), [4, 5, 6])

    // leading wildcard
    const obj2 = { a: { value: 'foo' }, b: { value: 'bar' }, c: { value: 'baz' } }
    t.deepEqual(get(obj2, '*.value'), ['foo', 'bar', 'baz'])

    // trailing wildcard
    const obj1 = { root: { a: 'foo', b: 'bar', c: 'baz' } }
    t.deepEqual(get(obj1, 'root.*'), ['foo', 'bar', 'baz'])

    // leading and trailing wildcards
    const obj3 = {
        a: { value: { foo: 'bar' } },
        b: { value: { bar: 'baz' } },
        c: { value: { baz: 'quux' } }
    }

    t.deepEqual(get(obj3, '**.value.**'), [['bar'], ['baz'], ['quux']])
    t.deepEqual(get(obj3, '*.value.*'), ['bar', 'baz', 'quux'])

    // TODO confirm deep wildcard matching works, i.e. multiple wildcards:
    // "foo.*.bar.*.baz"
})

test('no map', t => {
    const obj = node('**', 'quux')
    const get = getter({ map: false })

    t.deepEqual(get(obj, 'foo.**.baz.quux'), undefined)
    t.deepEqual(get(obj, ['foo', '**', 'baz', 'quux']), undefined)
    t.deepEqual(get(obj, 'foo.**.baz.quux', 42), 42)
    t.deepEqual(get(obj, ['foo', '**', 'baz', 'quux'], 42), 42)
    t.deepEqual(get(obj, 'foo.bar.**'), 'quux')
    t.deepEqual(get(obj, ['foo', 'bar', '**']), 'quux')
})

test('no flatMap', t => {
    const obj = node('*', 'quux')
    const get = getter({ flatMap: false })

    t.deepEqual(get(obj, 'foo.*.baz.quux'), undefined)
    t.deepEqual(get(obj, ['foo', '*', 'baz', 'quux']), undefined)
    t.deepEqual(get(obj, 'foo.*.baz.quux', 42), 42)
    t.deepEqual(get(obj, ['foo', '*', 'baz', 'quux'], 42), 42)
    t.deepEqual(get(obj, 'foo.bar.*'), 'quux')
    t.deepEqual(get(obj, ['foo', 'bar', '*']), 'quux')
})

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

test('quote', t => {
    const obj1 = node('a.b.c', 'd')
    const obj2 = node('[42]', 42)

    t.deepEqual(get(obj1, 'foo.bar["a.b.c"]'), 'd')
    t.deepEqual(get(obj1, 'foo.bar.a.b.c'), undefined)
    t.deepEqual(get(obj1, 'foo.bar.a.b.c', 42), 42)

    t.deepEqual(get(obj2, 'foo.bar["[42]"]'), 42)
    t.deepEqual(get(obj2, 'foo.bar[42]'), undefined)
    t.deepEqual(get(obj2, 'foo.bar[42]', 42), 42)
})
