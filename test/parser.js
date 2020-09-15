const test              = require('ava')
const Util              = require('util')
const { parser: parse } = require('..')
const TESTS             = require('./fixtures/parser.js')

require('array-flat-polyfill') // for Node v10

for (const [path, want] of Object.entries(TESTS)) {
    const name = Util.format('%j -> %j', path, want)

    test(name, t => {
        const got = parse(path)
        t.deepEqual(got, want)
    })
}
