'use babel';

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies
import { CompositeDisposable } from 'atom';
import path from 'path';
import * as helper from 'atom-linter';
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
    this.subscriptions.add(atom.config.observe('linter-js-yaml.customTags', (customTags) => {
      this.Schema = yaml.Schema.create(customTags.map(tag =>
        new yaml.Type(tag, { kind: 'scalar' }),
      ));
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
        const fileText = TextEditor.getText();

        const messages = [];
        const processMessage = (type, message) => {
          let line = message.mark.line;
          // Workaround for https://github.com/nodeca/js-yaml/issues/218
          const maxLine = TextEditor.getLineCount() - 1;
          if (line > maxLine) {
            line = maxLine;
          }
          const column = message.mark.column;
          return {
            type,
            text: message.reason,
            filePath,
            range: helper.generateRange(TextEditor, line, column),
          };
        };

        try {
          yaml.safeLoadAll(fileText, () => ({}), {
            filename: path.basename(filePath),
            schema: this.Schema,
            onWarning: (warning) => {
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
