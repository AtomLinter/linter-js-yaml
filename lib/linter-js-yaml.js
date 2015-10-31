'use babel';

import path from 'path';
import { CompositeDisposable } from 'atom';
import helper from 'atom-linter';
import yaml from 'js-yaml';

export default {
  config: {
    customTags: {
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
      description: 'List of YAML custom tags.',
    },
  },

  activate() {
    require('atom-package-deps').install('linter-js-yaml');
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-js-yaml.customTags', customTags => {
      this.Schema = yaml.Schema.create(customTags.map(tag => {
        return new yaml.Type(tag, { kind: 'scalar' });
      }));
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      grammarScopes: ['source.yaml', 'source.yml'],
      scope: 'file',
      name: 'Js-YAML',
      lintOnFly: true,
      lint: (TextEditor) => {
        const filePath = TextEditor.getPath();
        const fileText = TextEditor.buffer.cachedText;

        const messages = [];
        const processMessage = (type, message) => {
          const line = message.mark.line;
          const column = message.mark.column;
          return {
            type: type,
            text: message.reason,
            filePath: filePath,
            range: helper.rangeFromLineNumber(TextEditor, line, column),
          };
        };

        try {
          yaml.safeLoadAll(fileText, () => {}, {
            filename: path.basename(filePath),
            schema: this.Schema,
            onWarning: warning => {
              messages.push(processMessage('Warning', warning));
            },
          });
        } catch (error) {
          messages.push(processMessage('Error', error));
        }

        return messages;
      },
    };
  },
};
