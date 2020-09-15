const re = String.raw

const quoted         = re`(?: (["']) ( (?: \\. | (?: (?! \1) . ) )* ) \1 )`
const integer        = re`( [-+]? \d+ )`
const invalidBracket = re`(?: \[ (.?) )`
const name           = re`(?: (?: ^ | (?: (?! ^) \. ) ) ( [^\s"'\`\[\].\\]+ ) )`
const invalidToken   = re`(.)`

const $TOKEN = re`(?: (?: \[ (?: ${quoted} | ${integer} ) \] ) | ${invalidBracket} | ${name} | ${invalidToken} )`
const TOKEN = new RegExp($TOKEN.replace(/\s+/g, ''), 'g').toString()

const $DEBUG = process.env.DEBUG
const DEBUG = $DEBUG ? $DEBUG.trim().split(/\s+|\s*,\s*/) : []

if (DEBUG.includes('get-wild')) {
    console.log('\nTOKEN:', TOKEN)
}

module.exports = TOKEN
