# linter-js-cloudformation-yaml

This package will parse your YAML files in Atom through [js-yaml](https://github.com/connec/yaml-js), exposing any issues reported.

## Installation

```
$ apm install linter-js-cloudformation-yaml
```

## Settings

You can configure linter-js-cloudformation-yaml by editing ~/.atom/config.cson (choose Open Your Config in Atom menu) or in Preferences:

```cson
'linter-js-cloudformation-yaml':
  'customTags': [
    "!yaml"
    "!include"
  ]
```

- `customTags`: List of YAML custom tags. (Default: scalar)
