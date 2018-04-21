# linter-js-yaml

This package will parse your YAML files in Atom through
[js-yaml](https://github.com/connec/yaml-js), exposing any issues reported.

#### Installation

```
$ apm install linter-js-yaml
```

#### Settings

You can configure linter-js-yaml by editing ~/.atom/config.cson (choose Open Your Config in Atom menu) or in Preferences.
The node kind defaults to `scalar`, however `mapping` and `sequence` kinds can be specified following a space separator:

```cson
'linter-js-yaml':
  'customTags': [
    "!yaml"
    "!include"
    "!delta mapping"
    "!epsilon sequence"
  ]
```

* `customTags`: List of YAML custom tags, each optionally followed by a space and the node kind (scalar, mapping, or sequence).
