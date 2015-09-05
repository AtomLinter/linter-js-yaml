path = require 'path'

module.exports =
  provideLinter: ->
    yaml = require('js-yaml')
    provider =
      grammarScopes: ['source.yaml', 'source.yml']
      scope: 'file'
      lintOnFly: true
      processMessage: (type, path, message)->
        point = [message.mark.line, message.mark.column]
        {
          type: type,
          text: message.reason,
          filePath: path,
          range: [point, point]
        }
      lint: (textEditor)->
        return new Promise (resolve)->
          messages = []
          try
            yaml.safeLoad textEditor.getText(), onWarning: (warning) ->
              messages.push(provider.processMessage('Warning', textEditor.getPath(), warning))
          catch error
            messages.push(provider.processMessage('Error', textEditor.getPath(), error))
          resolve(messages)
