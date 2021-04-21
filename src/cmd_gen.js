// Update instance.

const { escapeRegExp } = require("./util_regexp")

const generateInstance = (template, bindings) => {
  const params = bindings.map(([name]) => name)
  // console.log("params", params)

  // Regexp that matches a parameter name.
  const someParam = params.map(s => {
    s = escapeRegExp(s)
    return `(${s})`
  }).join("|")

  return template.replace(new RegExp(someParam, "g"), (_, ...args) => {
    // console.log("hit", s, args)
    const pi = args.findIndex(a => a != null)
    return bindings[pi][1]
  })
}

module.exports = { generateInstance }
