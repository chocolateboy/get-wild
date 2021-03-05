const test      = require('ava')
const Util      = require('util')
const { parse } = require('../..')
const INVALID   = require('./fixtures/_invalid.js')

for (const path of INVALID) {
    const name = Util.inspect(path, { compact: true })

    test(name, t => {
        t.throws(
            () => parse(path),
            {
                instanceOf: SyntaxError,
                message: /\bInvalid step\b/,
            }
        )
    })
}
