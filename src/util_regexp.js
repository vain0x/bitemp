const REGEX_META = /[\\^$.()\[\]{}?+*|]/g
const escapeRegExp = s => s.replace(REGEX_META, s => `\\${s}`)

module.exports = { escapeRegExp }
