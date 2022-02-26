const { get, getter } = require('../dist/fp.js')
const test            = require('ava')

const {
    parser: defaultParser,
    split: defaultSplit
} = require('..')

const array = [
    [{ value: 1 }, { value: 2 }, { value: 3 }],
    [{ value: 4 }, { value: 5 }, { value: 6 }],
    [{ value: 7 }, { value: 8 }, { value: 9 }],
]

const data = {
    users: {
        'abc123': {
            name: 'John Doe',
            homepage: 'https://example.com/john-doe',
            hobbies: ['eating', 'sleeping'],
        },
        'def345': {
            name: 'Jane Doe',
            homepage: 'https://example.com/jane-doe',
        },
        'ghi567': {
            name: 'Nemo',
            hobbies: ['singing', 'dancing'],
        }
    }
}

test('get', t => {
    t.is(get('foo.bar.baz')(array), undefined)
    t.is(get('foo.bar.baz')(array, 42), undefined)

    t.is(get('[1][-2].value')(array), 5)
    t.is(get([-1, -1, 'value'])(array), 9)

    t.deepEqual(get('[-1].*.value')(array), [7, 8, 9])
    t.deepEqual(get('1.*.value')(array), [4, 5, 6])

    t.deepEqual(get('users.*.name')(data), [
        'John Doe',
        'Jane Doe',
        'Nemo'
    ])

    const get1 = get('users.*.hobbies', [])
    const get2 = get('users.*.hobbies')

    t.deepEqual(get1(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(get2(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(get('users.*.hobbies', [])(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(get1(data, undefined), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(get2(data, []), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(get('users.*.hobbies', 'foo')(data), [
        'eating',
        'sleeping',
        'foo',
        'singing',
        'dancing'
    ])

    t.deepEqual(get1(data, 'bar'), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(get2(data, 'bar'), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])
})

test('getter - default options', t => {
    const get1 = getter()

    t.is(get1('foo.bar.baz')(array), undefined)
    t.is(get1('foo.bar.baz')(array, 42), undefined)

    t.deepEqual(get1('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(get1('users.*.hobbies', [])(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])
})

test('getter - custom options', t => {
    const get1 = getter({ default: [] })
    const get2 = getter({ default: undefined })

    t.deepEqual(get1('foo.bar.baz')(array), [])
    t.deepEqual(get1('foo.bar.baz')(array, 42), [])

    t.is(get2('foo.bar.baz')(array), undefined)
    t.is(get2('foo.bar.baz')(array, 42), undefined)

    t.deepEqual(get1('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(get2('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(get1('users.*.hobbies', 'foo')(data), [
        'eating',
        'sleeping',
        'foo',
        'singing',
        'dancing'
    ])

    t.deepEqual(get2('users.*.hobbies', 'foo')(data), [
        'eating',
        'sleeping',
        'foo',
        'singing',
        'dancing'
    ])

    t.deepEqual(get1('users.*.hobbies', undefined)(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(get2('users.*.hobbies', undefined)(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])
})

// confirm the path is pre-parsed
test('pre-parsed path', t => {
    let called = 0

    const split = path => {
        ++called
        return path.split(':')
    }

    const get = getter({ split, default: [] })('users:*:hobbies')
    const want = ['eating', 'sleeping', 'singing', 'dancing']

    for (let i = 0; i < 10; ++i) {
        t.deepEqual(get(data), want)
    }

    t.is(called, 1)
})
