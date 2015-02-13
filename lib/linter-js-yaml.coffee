fs = require 'fs'
yaml = require 'js-yaml'
linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"

class LinterJsYaml extends Linter
  # The syntax that the linter handles. May be a string or
  # list/tuple of strings. Names should be all lowercase.
  @syntax: ['source.yaml']

  # A string, list, tuple or callable that returns a string, list or tuple,
  # containing the command line (with arguments) used to lint.
  cmd: 'js-yaml.js'

  executablePath: null

  linterName: 'js-yaml'

  isNodeExecutable: yes

  errorStream: 'stderr'

  # A regex pattern used to extract information from the executable's output.
  regex: 'JS-YAML: (?<message>.+) at line (?<line>\\d+), column (?<col>\\d+):'

  constructor: (editor) ->
    super(editor)

    atom.config.observe 'linter-js-yaml.jsYamlExecutablePath', =>
      @executablePath = atom.config.get 'linter-js-yaml.jsYamlExecutablePath'

  lintFile: (filePath, callback) ->
    input = fs.readFileSync filePath, 'utf8'
    messages = []

    try
      yaml.load input, onWarning: (error) =>
        msg = @createMessage error
        messages.push msg if msg.range?
    catch error
      msg = @createMessage error
      messages.push msg if msg.range?

    callback messages

  createMessage: (error) ->
    match =
      line: error.mark.line
      col: error.mark.column
      message: error.reason

    # fix column num, first line is 0
    match.line += 1

    super(match)

  destroy: ->
    atom.config.unobserve 'linter-js-yaml.jsYamlExecutablePath'

module.exports = LinterJsYaml
