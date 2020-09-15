const quoted         = / (?: (["']) ( (?: (?: \\. ) | (?: (?! \1) . ) )* ) \1 ) /.source
const integer        = / ( [-+]? \d+ ) /.source
const invalidBracket = / (?: \[ (.?) ) /.source
const name           = / (?: (?: (?: ^ ) | (?: (?<= .) \. ) ) ( [^\s"'`\[\].]+ ) ) /.source
const invalidToken   = / (.) /.source

const $TOKEN = `(?: (?: \\[ (?: ${quoted} | ${integer} ) \\] ) | ${invalidBracket} | ${name} | ${invalidToken} )`

const DEBUG = process.env.DEBUG?.trim()?.split(/\s+|\s*,\s*/) || []
const TOKEN = new RegExp($TOKEN.replace(/\s+/g, ''), 'g').toString()

if (DEBUG.includes('get-wild')) {
    console.log('TOKEN:', TOKEN)
}

module.exports = TOKEN
