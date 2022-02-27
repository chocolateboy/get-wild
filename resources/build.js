const re = String.raw

const quoted  = re`(?: (["']) ( (?: \\. | (?: (?! \1) . ) )* ) \1 )`
const integer = re`( [-+]? \d+ )`
const name    = re`(?: (?: ^ | (?: (?! ^) \. ) ) ( [^\s"'\`\[\].\\]+ ) )`
const error   = re`(.)`
const token   = re`(?: (?: \[ (?: ${quoted} | ${integer} ) \] ) | ${name} | ${error} )`

const TOKEN = new RegExp(token.replace(/\s+/g, ''), 'g').toString()
const DEBUG = process.env.DEBUG
const $DEBUG = DEBUG ? DEBUG.trim().split(/\s+|\s*,\s*/) : []

if ($DEBUG.includes('get-wild')) {
    console.log('\nTOKEN:', TOKEN)
}

module.exports = TOKEN
