// Update template.

const { escapeRegExp } = require("./util_regexp")

const EOL = "<!L!>"
const PARAM = "<!P!>"

const failwith = message => {
  throw new Error(message)
}

/// bindings: [paramName, paramValue][]
const updateTemplate = (instance, template, bindings) => {
  {
    const s = template
    if (s.includes(PARAM) || s.includes(EOL)) {
      throw new Error(`Unimplemented: can't contain '${EOL}' or '${PARAM}'.`)
    }
  }

  // Parameter name to index.
  const indexOf = (() => {
    const map = new Map()
    for (const [i, [name]] of bindings.entries()) {
      map.set(name, i)
    }
    return name => map.get(name) ?? failwith(`Unknown parameter: '${name}'.`)
  })()

  // paramOrder[i] = pi <=>
  //    The i'th parameter occurred in the template
  //    corresponds to the (pi)'th parameter in the binding list.
  const paramOrder = []
  {
    const params = bindings.map(([name]) => name)

    // Regexp that matches a parameter name.
    const someParam = params.map(s => {
      s = escapeRegExp(s)
      return `(${s})`
    }).join("|")

    // Split the template by parameter names.
    const r = new RegExp(someParam, "g")
    while (true) {
      const m = r.exec(template)
      if (m == null) {
        break
      }

      const name = m[0]
      const pi = indexOf(name)
      paramOrder.push(pi)
    }
  }
  const n = paramOrder.length

  let output = ""
  {
    // FIXME: Non-deterministic, if empty-value is bound to some parameter, by producing `(.*)(.*)`.
    const paramValues = paramOrder.map(pi => escapeRegExp(bindings[pi][1]).replace(/\r?\n/g, EOL))
    const r = new RegExp("^(.*)" + paramValues.join("(.*)") + "(.*)$")

    const s = instance.replace(/\r?\n/g, EOL)
    const m = s.match(r)
    if (m == null) {
      console.error("hint: params:", paramOrder.map(i => bindings[i]), "\ns:", s, "\nr", r.source)
      throw new Error("Template doesn't match.")
    }

    // console.log(n, m.length)

    const g = m.slice(1).map(x => x.split(EOL).join("\n"))
    for (let i = 0; i < n; i++) {
      output += g[i]
      output += bindings[paramOrder[i]][0]
    }
    output += g[n]
  }

  return output
}

module.exports = { updateTemplate }
