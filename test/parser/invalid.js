const test      = require('ava')
const { parse } = require('../..')
const INVALID   = require('./fixtures/_invalid.js')

for (const path of INVALID) {
    const name = JSON.stringify(path)

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
