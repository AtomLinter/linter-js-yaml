path = require 'path'

module.exports =
  config:
    jsYamlExecutablePath:
      default: path.join __dirname, '..', 'node_modules', 'js-yaml', 'bin'
      title: 'Js Yaml Executable Path'
      type: 'string'

  activate: ->
    console.log 'activate linter-js-yaml'
