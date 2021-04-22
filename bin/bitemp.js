#!/usr/bin/env node

const fs = require("fs/promises")
const { extractParams } = require("../src/cmd_param")
const { generateInstance } = require("../src/cmd_gen")
const { updateTemplate } = require("../src/cmd_temp")

const VERSION = "0.1.0"

const helpText = () => `\
bitemp v${VERSION} <https://github.com/vain0x/bitemp>

Experimental bidirectional template engine.

SUBCOMMANDS:
    gen <PARAM>
        Generate an instance from template and parameter.

    param <INSTANCE> <PARAM>
        Update the parameter based on a modified instance.
        (Template must be unchanged.)

    temp <INSTANCE> <PARAM>
        Update the template based on a modified instance.
        (Parameters must be unchanged.)

    -h, --help, help          Print help.
    -V, --version, version    Print version.`

// -----------------------------------------------
// util
// -----------------------------------------------

const failwith = message => {
  throw new Error(message)
}

const readTextFile = filename => fs.readFile(filename, { encoding: "utf-8" })

const readJsonFile = filename => fs.readFile(filename, { encoding: "utf-8" }).then(x => JSON.parse(x))

// -----------------------------------------------
// args
// -----------------------------------------------

const ensureEmpty = args => {
  const arg = args.shift()
  if (arg != null) {
    throw new Error(`Redundant parameter: '${arg}'.`)
  }
}

const parseArgs = () => {
  // Typically, args is [node, xxx.js, ...] or [xxx, ...].
  const args = process.argv.slice()

  if (args[0]?.endsWith("node")) {
    args.splice(0, 2)
  } else {
    args.shift()
  }

  const subcommand = args.shift() ?? "help"
  switch (subcommand) {
    case "help":
    case "-h":
    case "--help":
      console.log(helpText())
      process.exit(0)

    case "version":
    case "-V":
    case "--version":
      console.log(VERSION)
      process.exit(0)

    case "gen":
    case "generate": {
      const paramFile = args.shift() ?? failwith("Missed an argument: <PARAM>.")
      ensureEmpty(args)

      return ["gen", paramFile]
    }
    case "param":
    case "parameter": {
      const instanceFile = args.shift() ?? failwith("Missed arguments: <INSTANCE> <PARAM>.")
      const paramFile = args.shift() ?? failwith("Missed an argument: <PARAM>.")
      ensureEmpty(args)

      return ["param", instanceFile, paramFile]
    }
    case "temp":
    case "template":
    case "tmp": {
      const instanceFile = args.shift() ?? failwith("Missed arguments: <INSTANCE> <PARAM>.")
      const paramFile = args.shift() ?? failwith("Missed an argument: <PARAM>.")
      ensureEmpty(args)

      return ["temp", instanceFile, paramFile]
    }
    default:
      throw new Error(`Unknown argument '${subcommand}'.`)
  }
}

// ===============================================

const main = async () => {
  const [subcommand, ...args] = parseArgs()
  switch (subcommand) {
    case "gen": {
      const [paramFile] = args

      const paramData = await readJsonFile(paramFile)
      const templateFile = paramData["template"] ?? failwith("Missed 'template' in param file.")
      const template = await readTextFile(templateFile)

      await Promise.all(
        paramData["instances"].map(({ file, params }) => ({
          file,
          instance: generateInstance(template, Object.entries(params)),
        })).map(({ file, instance }) => (
          fs.writeFile(file, instance)
        )))
      return
    }
    case "param": {
      const [instanceFile, paramFile] = args

      const [instance, paramData] = await Promise.all([
        readTextFile(instanceFile),
        readJsonFile(paramFile),
      ])

      const templateFile = paramData["template"] ?? failwith("Missed 'template' in param file.")
      const instances = paramData["instances"] ?? failwith("Missed 'instances' in param file.")

      const template = await readTextFile(templateFile)

      // Identify the instance in the param file.
      const instanceStat = await fs.lstat(instanceFile)
      let instanceIndex = await (async () => {
        for (const [i, { file }] of instances.entries()) {
          const s = await fs.lstat(file).catch(() => null)
          const same = s != null && instanceStat.ino === s.ino
          if (same) {
            return i
          }
        }
        return null
      })()
      // console.log("instanceIndex", instanceIndex)
      if (instanceIndex == null) {
        instanceIndex = instances.push({ file: instanceFile, params: {} }) - 1
      }
      const params = Object.keys(instances[instanceIndex]["params"])

      const newParams = extractParams(instance, template, params)
      instances[instanceIndex]["params"] = newParams

      // console.log("newParams", newParams)
      await fs.writeFile(paramFile, JSON.stringify(paramData, undefined, 4))

      await Promise.all(
        instances.map(({ file, params }) => ({
          file,
          instance: generateInstance(template, Object.entries(params)),
        })).map(({ file, instance }) => (
          fs.writeFile(file, instance)
        )))
      return
    }
    case "temp": {
      const [instanceFile, paramFile] = args

      const [instance, paramData] = await Promise.all([
        readTextFile(instanceFile),
        readJsonFile(paramFile),
      ])

      const templateFile = paramData["template"] ?? failwith("Missed 'template' in param file.")
      const instances = paramData["instances"] ?? failwith("Missed 'instances' in param file.")

      const template = await readTextFile(templateFile)

      // Identify the instance in the param file.
      const instanceStat = await fs.lstat(instanceFile)
      let instanceIndex = await (async () => {
        for (const [i, { file }] of instances.entries()) {
          const s = await fs.lstat(file).catch(() => null)
          const same = s != null && instanceStat.ino === s.ino
          if (same) {
            return i
          }
        }
        return null
      })()
      // console.log("instanceIndex", instanceIndex)
      // if (instanceIndex == null) {
      //   instanceIndex = instances.push({ file: instanceFile, params: {} }) - 1
      // }
      if (instanceIndex == null) {
        console.error("hint: instanceFile:", instanceFile, "\n  paramFile:", paramFile)
        throw new Error(`Instance is not registered in param file.`)
      }

      const bindings = Object.entries(instances[instanceIndex]["params"])
      // console.log("bindings", bindings)

      const newTemplate = updateTemplate(instance, template, bindings)

      await fs.writeFile(templateFile, newTemplate)

      await Promise.all(
        [...instances.slice(0, instanceIndex), ...instances.slice(instanceIndex + 1)].map(({ file, params }) => ({
          file,
          instance: generateInstance(newTemplate, Object.entries(params)),
        })).map(({ file, instance }) => (
          fs.writeFile(file, instance)
        )))
      return
    }
    default:
      throw new Error(`Unknown argument '${subcommand}'.`)
  }
}

{
  (async () => {
    try {
      await main()
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })()
}
