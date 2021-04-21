# bitemp

Experiment of "bidirectional template engine."

- [Install wih npm](#install-with-npm)
- [Usage](#usage)
- [Guide](#guide)
- [Motivation](#motivation)

### Install with npm

```sh
git clone https://github.com/vain0x/bitemp --filter=blob:none
cd bitemp
npm install --global .   # maybe with sudo
```

## Features

Bitemp CLI supports these three subcommands:

- `gen`: `?I = template(parameter)`.
    - Update an instance from a template and a parameter. Normal "template" process.
- `param`: `instance = template(?P)`.
    - Update a parameter from a pair of an instance and a template.
- `temp`: `instance = ?T(parameter)`.
    - Update a template from a pair of an instance and a parameter.

Remark: Not ideally, both template and parameter can't be modified at the same time.

## Usage

FIXME: more explanation
FIXME: these commands don't write to files but to stdout for now...

See `bitemp --help`.

The [test](test) command and [tests](tests) directory might be helpful for a while.

### `param.json`

Structure:

```json
{
    "template": "<path to template file, relative to working directory of process>",
    "instances": [
        {
            "file": "<path to instance file, relative to working directory of process>",
            "params": {
                "{{placeholder}}": "<value>"
            }
        }
    ]
}
```

----

## Guide

### Creating a template

First, write an instance file by hand.

```
Hello, John!
```

(↑ `instance.txt`)

Copy it to create a template file, replace some parts with "parameters."

```
Hello, {{name}}!
```

(↑ `template.txt`)

Create a param file (see above).
Set 'template' path.
Add the initial instance to 'instances' list with parameters (no value).

```json
{
    "template": "template.txt",
    "instances": [
        {
            "file": "instance.txt",
            "params": {
                "{{name}}": ""
            }
        }
    ]
}
```

Fill parameter values automatically.

```sh
bitemp param instance.txt param.json
```

See what happened.

```sh
grep '{{name}}' param.json
```

```
                "{{name}}": "John"
```

### ...

FIXME: more guide

----

## Motivation

Terminology: an "instance" is a template transformed by filling parameters with specific values.

Equation:

```
    instance = template(parameter)
```

Normal template engine generates an instance from a template and a parameter.
When you want to make some change to an instance, you can't just modify the since.
Because the template engine will *overwrites the manual update later.
Instead, you need to update a template and/or a parameter.

That is, "indirect modification" is required. There are several problems about this:

(1) Difficulty of template modification

More complicated template, more difficult modification.
Translation from "how to change instance" to "how to change template" is hard.

One reason is that correspondence between a part of instance and that of template is not always trivial.

(2) Template itself is typically *invalid* in the target language

Editor supports for the target language (language of instances) work partially while editing a template.
(Consider an HTML template including `<% placeholder %>`s.)

### Solution with "bidirectional"

What if an ideal "bidirectional template engine" supports update command from an instance to a template and a parameter?
The two issues are solved.

(1) Difficulty of template modification

A. Just modify an instance, and then feed back to the template and parameter.
(One down side is that new consideration "how does feed back process correctly work?" occurs.)

(2) Template itself is typically *invalid* in the target language

A. Editor supports work as usual while editing an instance.
