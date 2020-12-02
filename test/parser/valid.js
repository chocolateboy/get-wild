const test      = require('ava')
const Util      = require('util')
const { parse } = require('../..')
const VALID     = require('./fixtures/_valid.js')

require('array-flat-polyfill') // for Node v10

for (const [path, want] of Object.entries(VALID)) {
    const name = Util.format('%j -> %j', path, want)

    test(name, t => {
        const got = parse(path)
        t.deepEqual(got, want)
    })
}
