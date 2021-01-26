const test = require('ava')

const {
    get,
    getter,
    pluck,
    plucker,
} = require('../dist/fp.js')

const {
    parser: defaultParser,
    split: defaultSplit,
} = require('..')

require('array-flat-polyfill') // for Node v10

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
    t.is(get('[1][-2].value')(array), 5)
    t.is(get([-1, -1, 'value'])(array), 9)

    t.deepEqual(get('[-1].*.value')(array), [7, 8, 9])
    t.deepEqual(get('1.*.value')(array), [4, 5, 6])

    t.deepEqual(get('users.*.name')(data), [
        'John Doe',
        'Jane Doe',
        'Nemo'
    ])

    const get1 = get('users.*.hobbies')

    t.deepEqual(get1(data), [
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

    t.deepEqual(get1(data, []), [
        'eating',
        'sleeping',
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
        'bar',
        'singing',
        'dancing'
    ])
})

test('getter - default options', t => {
    const get1 = getter()
    const get2 = getter()('users.*.hobbies')

    t.deepEqual(get2(data), [
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

    t.deepEqual(get2(data, []), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])
})

test('getter - custom options', t => {
    const get1 = getter({ default: [] })
    const get2 = get1('users.*.hobbies')

    t.deepEqual(get2(data), [
        'eating',
        'sleeping',
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

    t.deepEqual(get2(data, undefined), [
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

    t.deepEqual(get2(data, 'bar'), [
        'eating',
        'sleeping',
        'bar',
        'singing',
        'dancing'
    ])

    t.deepEqual(get1('users.*.hobbies', 'foo')(data, 'baz'), [
        'eating',
        'sleeping',
        'baz',
        'singing',
        'dancing'
    ])
})

test('pluck', t => {
    t.is(pluck('[1][-2].value')(array), 5)
    t.is(pluck([-1, -1, 'value'])(array), 9)

    t.deepEqual(pluck('[-1].*.value')(array), [7, 8, 9])
    t.deepEqual(pluck('1.*.value')(array), [4, 5, 6])

    t.deepEqual(pluck('users.*.name')(data), [
        'John Doe',
        'Jane Doe',
        'Nemo'
    ])

    const pluck1 = pluck('users.*.hobbies', [])
    const pluck2 = pluck('users.*.hobbies')

    t.deepEqual(pluck1(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck2(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck('users.*.hobbies', [])(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck1(data, undefined), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck2(data, []), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck('users.*.hobbies', 'foo')(data), [
        'eating',
        'sleeping',
        'foo',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck1(data, 'bar'), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck2(data, 'bar'), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])
})

test('plucker - default options', t => {
    const pluck1 = plucker()

    t.deepEqual(pluck1('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck1('users.*.hobbies', [])(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])
})

test('plucker - custom options', t => {
    const pluck1 = plucker({ default: [] })
    const pluck2 = plucker({ default: undefined })

    t.deepEqual(pluck1('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck2('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck1('users.*.hobbies', 'foo')(data), [
        'eating',
        'sleeping',
        'foo',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck2('users.*.hobbies', 'foo')(data), [
        'eating',
        'sleeping',
        'foo',
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck1('users.*.hobbies', undefined)(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(pluck2('users.*.hobbies', undefined)(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])
})

// confirm the path is pre-parsed
test('pre-parsed path', t => {
    let called1 = 0, called2 = 0

    const split1 = path => {
        ++called1
        return path.split('/')
    }

    const split2 = path => {
        ++called2
        return path.split(':')
    }

    const get = getter({ split: split1, default: [] })('users/*/hobbies')
    const pluck = plucker({ split: split2, default: [] })('users:*:hobbies')
    const want = ['eating', 'sleeping', 'singing', 'dancing']

    for (let i = 0; i < 10; ++i) {
        t.deepEqual(get(data), want)
        t.deepEqual(pluck(data), want)
    }

    t.is(called1, 1)
    t.is(called2, 1)
})
