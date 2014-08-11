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

  destroy: ->
    atom.config.unobserve 'linter-js-yaml.jsYamlExecutablePath'

  createMessage: (match) ->
    # Easy fix when editor has no newline at end of file
    if match.line > @editor.getLineCount()
      match.line = @editor.getLineCount()
    super(match)

module.exports = LinterJsYaml
