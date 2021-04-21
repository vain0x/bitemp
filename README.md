# bitemp

Experiment of bidirectional template engine.

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

## Mechanism

What if an ideal "bidirectional template engine" supports update command from an instance to a template and a parameter?
The two issues are solved.

(1) Difficulty of template modification

A. Just modify an instance, and then feed back to the template and parameter.
(One down side is that new consideration "how does feed back process correctly work?" occurs.)

(2) Template itself is typically *invalid* in the target language

A. Editor supports work as usual while editing an instance.

## Bitemp

Bitemp is an experimental implementation of bidirectional template engine.
Not ideal yet.
Both template and parameter can't be modified at the same time.

Bitemp CLI tool supports three subcommands:

- `generate`: `?I = template(parameter)`.
    - Update instances from template and parameters. Normal "template" process.
- `extract`: `instance = template(?P)`.
    - Update a parameter from template and instances.
- `pull`: `instance = ?T(parameter)`.
    - Update a template from a pair of parameter and instance.
