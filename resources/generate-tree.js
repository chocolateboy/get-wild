// generate a (slightly) deeply nested structure to shake out bugs that are
// hidden by toy examples
//
// see test/fixtures/deep.json for the output

const LENGTH = Number(process.argv[2] || 7)
const ROOT = {}
const TARGETS = [ROOT]

const alphabet = Array.from(Array(LENGTH), (_, i) => {
    return String.fromCharCode('a'.charCodeAt() + i)
})

while (alphabet.length > 1) {
    const letter = alphabet.shift()
    const targets = TARGETS.splice(0) // drain

    for (const target of targets) {
        const pair = [{}, {}]
        target[letter] = pair
        TARGETS.push(...pair)
    }
}

TARGETS.forEach((target, i) => { target[alphabet[0]] = i + 1 })
console.log(JSON.stringify(ROOT, null, 4))
