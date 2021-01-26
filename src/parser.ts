// @ts-ignore
const TOKEN: RegExp = codegen.require('../resources/build.js')

const ESCAPED = /\\(.)/g

const parser = (path: string) => {
    let steps: Array<string | number> = []
    let result: RegExpExecArray | null

    while (result = TOKEN.exec(path)) {
        let [
            /* match */,
            quote,
            quoted,
            integer,
            /* invalid bracket */,
            name,
            /* invalid token */
        ] = result

        let step

        if (quote) {
            step = quoted.replace(ESCAPED, (...args: any[]) => args[1] === quote ? quote : args[0])
        } else if (integer) {
            step = +integer
        } else if (name) {
            step = name
        } else { // invalid bracket or token
            // TODO switch to String#matchAll when Node.js v10 is EOL
            //
            // XXX although String#matchAll is currently slower than RegExp#exec
            // (but slightly faster than String#replace)
            TOKEN.lastIndex = 0

            throw new SyntaxError(`Invalid step @ ${result.index}: ${JSON.stringify(path)}`)
        }

        steps.push(step)
    }

    return steps
}

export default parser
