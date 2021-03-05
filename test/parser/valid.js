const test      = require('ava')
const Util      = require('util')
const { parse } = require('../..')
const VALID     = require('./fixtures/_valid.js')

const dump = value => Util.inspect(value, { compact: true })

for (const [path, want] of Object.entries(VALID)) {
    const name = Util.format('%s -> %s', dump(path), dump(want))

    test(name, t => {
        const got = parse(path)
        t.deepEqual(got, want)
    })
}
