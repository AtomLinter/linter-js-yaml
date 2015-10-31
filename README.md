# linter-js-yaml

This package will lint your `.yaml` opened files in Atom through [js-yaml](https://github.com/connec/yaml-js).

#### Installation

```
$ apm install linter-js-yaml
```

#### Settings

You can configure linter-js-yaml by editing ~/.atom/config.cson (choose Open Your Config in Atom menu) or in Preferences:

```cson
'linter-js-yaml':
  'customTags': [
    "!yaml"
    "!include"
  ]
```

* `customTags`: List of YAML custom tags. (Default: scalar)

## Contributing

If you would like to contribute enhancements or fixes, please do the following:

1. Fork the plugin repository
2. Hack on a separate topic branch created from the latest `master`
3. Commit and push the topic branch
4. Make a pull request
5. Welcome to the club!

Please note that modifications should follow these coding guidelines:

* Indent is 2 spaces with `.editorconfig`
* Code should pass `eslint` linter with the provided `.eslintrc`
* Vertical whitespace helps readability, don’t be afraid to use it

**Thank you for helping out!**
