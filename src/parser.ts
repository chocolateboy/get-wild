// @ts-ignore
const TOKEN: RegExp = codegen.require('../resources/build.js')

const $JSON = JSON
const ESCAPED = /\\(.)/g

const parser = (path: string) => {
    const steps: Array<string | number> = []

    path.replace(TOKEN, (_match, quote, quoted, integer, _invalidBracket, name, _invalidToken, offset: number) => {
        // console.warn({ path, _match, quote, quoted, integer, _invalidBracket, name, _invalidToken, offset })

        let step

        if (quote) {
            step = quoted.replace(ESCAPED, (...args: any[]) => args[1] === quote ? quote : args[0])
        } else if (integer) {
            step = +integer
        } else if (name) {
            step = name
        } else { // invalid bracket or token
            throw new SyntaxError(`Invalid step @ ${offset}: ${$JSON.stringify(path)}`)
        }

        steps.push(step)

        return ''
    })

    return steps
}

export default parser
