# bitemp

Experiment of "bidirectional template engine."

- [Install wih npm](#install-with-npm)
- [Documentation](#documentation)
- [Guide](#guide)
- [Motivation](#motivation)

### Install with npm

```sh
git clone https://github.com/vain0x/bitemp --filter=blob:none
cd bitemp
npm install --global .   # maybe with sudo
```

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

Create a param file like this.
Set `template` path.
Add an initial instance to `instances` list with parameters (no value).

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

Let the command fill these parameter values automatically.

```sh
bitemp param instance.txt param.json
```

To verify the result, look into `param.json`.

```sh
grep '{{name}}' param.json
```

```json
                "{{name}}": "John"
```

### Adding instance

To add new instance, create new instance file by copying the template file.
Replace parameters with actual values manually.

```
Hello, Jane!
```

(↑ `new-instance.txt`)

Add an entry to "instances" array.

```json
{
    "template": <snip>,
    "instances": [
        {
            <snip>
        },
        {
            "file": "new-instance.txt",
            "params": {
                "{{name}}": ""
            }
        }
    ]
}
```

Again, do:

```sh
bitemp param new-instance.txt param.json
```

### Modifying templated part

Update an instance file manually.

```
Bye, John.
```

(↑ `instance.txt` modified)

Update the template with `temp` subcommand.

```sh
bitemp temp instance.txt param.json
```

Change of template is applied to other instances. See like this:

```sh
cat new-instance.txt
```

```
Bye, Jane!
```

### ...

TODO: more guide

----

## Documentation

- `gen`: `?I = template(parameter)`.
    - Update an instance from a template and a parameter. Normal "template" process.
- `param`: `instance = template(?P)`.
    - Update a parameter from a pair of an instance and a template.
- `temp`: `instance = ?T(parameter)`.
    - Update a template from a pair of an instance and a parameter.

See also `bitemp --help`.

The [test](test) command and [tests](tests) directory might be helpful.

Remark: Not ideally, both template and parameter can't be modified at the same time.

### `param.json`

A "param file" (say, `param.json`) is a JSON file to store data about template and instance parameter values.

Structure:

```json
{
    "template": "<path to template file, relative to working directory of process>",
    "instances": [
        {
            "file": "<path to instance file, relative to working directory of process>",
            "params": {
                "{{parameter}}": "<value>"
            }
        }
    ]
}
```

----

## Motivation

Terminology: an "instance" is a template transformed by filling parameters with specific values.

Equation:

```
    instance = template(parameter)
```

Template engine generates an instance from a template and a parameter.
When you want to modify an instance, you can't just modify it directly.
Because the template engine will *overwrites* the manual modification later.
Instead, you need to update a template and/or a parameter.

That is, indirect modification is required. There are several problems about this:

(1) Difficulty of modification task

More complicated template, more difficult modification.
Translation from "how to change instance" to "how to change template" is hard.

One reason is that correspondence between a part of instance and that of template is not always trivial.

(2) Template itself is typically *invalid* in the target language

Editor supports for the target language (language of instances) work partially while editing a template.
(Consider an HTML template including `<% parameter %>`s.)

### Solution with "bidirectional"

What if an ideal "bidirectional template engine" supports update command from an instance to a template and a parameter?
The two issues are solved.

(1) Difficulty of template modification

A. Just modify an instance, and then feed back to the template and parameter.
(One down side is that new consideration "how does feed back process correctly work?" occurs.)

(2) Template itself is typically *invalid* in the target language

A. Editor supports work as usual while editing an instance.
