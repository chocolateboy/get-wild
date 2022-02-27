declare const codegen: { require: (path: string) => RegExp };

type Step = string | number;

const TOKEN = codegen.require('../resources/build.js')
const ESCAPED = /\\(.)/g

const parser = (path: string) => {
    const steps: Step[] = []

    for (const { index, 1: quote, 2: quoted, 3: integer, 4: name } of path.matchAll(TOKEN)) {
        let step: Step

        if (name) {
            step = name
        } else if (integer) {
            step = +integer
        } else if (quote) {
            step = quoted.replace(ESCAPED, (match, escaped) => escaped === quote ? quote : match)
        } else {
            throw new SyntaxError(`Invalid step @ ${index}: ${JSON.stringify(path)}`)
        }

        steps.push(step)
    }

    return steps
}

export default parser
