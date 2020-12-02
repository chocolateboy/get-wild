const test            = require('ava')
const { get, getter } = require('../dist/fp.js')

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

test('fp/get', t => {
    t.is(get('[1][-2].value')(array), 5)
    t.is(get([-1, -1, 'value'])(array), 9)

    t.deepEqual(get('[-1].*.value')(array), [7, 8, 9])
    t.deepEqual(get('1.*.value')(array), [4, 5, 6])

    t.deepEqual(get('users.*.name')(data), [
        'John Doe',
        'Jane Doe',
        'Nemo'
    ])

    t.deepEqual(get('users.*.hobbies')(data), [
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

    t.deepEqual(get('users.*.hobbies')(data, []), [
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

    t.deepEqual(get('users.*.hobbies')(data, 'bar'), [
        'eating',
        'sleeping',
        'bar',
        'singing',
        'dancing'
    ])

    t.deepEqual(get('users.*.hobbies')(data, 'bar'), [
        'eating',
        'sleeping',
        'bar',
        'singing',
        'dancing'
    ])
})

test('fp/getter - default options', t => {
    const get = getter()

    t.deepEqual(get('users.*.hobbies')(data), [
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

    t.deepEqual(get('users.*.hobbies')(data, []), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])
})

test('fp/getter - custom options', t => {
    const get = getter({ default: [] })

    t.deepEqual(get('users.*.hobbies')(data), [
        'eating',
        'sleeping',
        'singing',
        'dancing'
    ])

    t.deepEqual(get('users.*.hobbies', undefined)(data), [
        'eating',
        'sleeping',
        undefined,
        'singing',
        'dancing'
    ])

    t.deepEqual(get('users.*.hobbies')(data, undefined), [
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

    t.deepEqual(get('users.*.hobbies')(data, 'bar'), [
        'eating',
        'sleeping',
        'bar',
        'singing',
        'dancing'
    ])

    t.deepEqual(get('users.*.hobbies', 'foo')(data, 'bar'), [
        'eating',
        'sleeping',
        'bar',
        'singing',
        'dancing'
    ])
})
