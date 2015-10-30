'use babel';

import path from 'path';

function processMessage(type, filePath, message) {
  const line = message.mark.line;
  const column = message.mark.column;
  return {
    type: type,
    text: message.reason,
    filePath: filePath,
    range: [[line, column], [line, column + 1]],
  };
}

class LinterJsYaml {
  activate() {
    require('atom-package-deps').install('linter-js-yaml');
  }

  provideLinter() {
    const yaml = require('js-yaml');

    return {
      grammarScopes: ['source.yaml', 'source.yml'],
      scope: 'file',
      name: 'Js-YAML',
      lintOnFly: true,
      lint: (TextEditor) => {
        const filePath = TextEditor.getPath();
        const fileText = TextEditor.buffer.cachedText;

        const messages = [];

        try {
          yaml.safeLoad(fileText, {
            filename: path.basename(filePath),
            onWarning: (warning) => {
              messages.push(processMessage('Warning', filePath, warning));
            },
          });
        } catch (error) {
          messages.push(processMessage('Error', filePath, error));
        }

        return messages;
      },
    };
  }
}

export default new LinterJsYaml();
