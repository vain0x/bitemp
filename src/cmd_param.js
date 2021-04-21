// Update parameter.

const { escapeRegExp } = require("./util_regexp")

const EOL = "<!L!>"
const PARAM = "<!P!>"

const extractParams = (instance, template, params) => {
  {
    const t = template
    if (t.includes(PARAM) || t.includes(EOL)) {
      throw new Error(`Unimplemented: can't contain '${EOL}' or '${PARAM}'.`)
    }
  }

  // Convert template to regexp pattern, replacing all parameter with a group of `(.*)`. (FIXME: use named captures?)
  // template: `foo... {{param}}... bar...`
  // regexp: `^foo... (.*)... bar...$`
  let templateRegexp

  // ord[pi] = mi <=> (pi)'th parameter is stored in (mi)'th matching group.
  const ord = []

  {
    // Regexp that matches a parameter name.
    const someParam = params.map(s => {
      s = escapeRegExp(s)
      return `(${s})`
    }).join("|")

    let mi = 0
    let s = template
    s = s.replace(new RegExp(someParam, "g"), (_, ...groups) => {
      const pi = groups.findIndex(a => a != null)
      ord[pi] = ord[pi] ?? mi
      mi++
      return PARAM
    })
    s = escapeRegExp(s)
    s = "^" + s.split(PARAM).join("(.*)").split(/\r?\n/g).join(EOL) + "$"
    templateRegexp = new RegExp(s)
  }

  // Extract parameter values with regexp matching.
  let m
  {
    const s = instance.split(/\r?\n/g).join(EOL)
    m = s.match(templateRegexp)
    if (m == null) {
      console.error("hint: \n\nregexp:", templateRegexp.source, "\n\ninstance:", s, "\n")
      console.error("params", params)
      throw new Error("Failed to match. Instance must keep including parameter values in order as template does.")
    }
    // console.log("m", m?.length, ...m?.slice(1).map(x => `'${x}'`) ?? [])
  }

  const data = {}
  for (const [pi, param] of params.entries()) {
    const value = m[1 + ord[pi]].split(EOL).join("\n")
    Object.defineProperty(data, param, { value, enumerable: true, writable: false, configurable: false })
  }
  return data
}

module.exports = { extractParams }
