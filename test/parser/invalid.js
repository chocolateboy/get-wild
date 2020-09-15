const test              = require('ava')
const { parser: parse } = require('../..')
const INVALID           = require('./fixtures/_invalid.js')

require('array-flat-polyfill') // for Node v10

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
