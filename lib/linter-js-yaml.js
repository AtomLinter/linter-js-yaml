'use babel';

import path from 'path';
import { CompositeDisposable } from 'atom';
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
      const customTypeTags = [];
      customTags.map((tag) => {
        if (typeof tag === 'object') {
          customTypeTags.push(new yaml.Type(tag.tag, { kind: tag.kind || 'scalar' }));
        }
        if (typeof tag === 'string') {
          customTypeTags.push(new yaml.Type(tag, { kind: 'scalar' }));
        }
        return this;
      });
      this.Schema = yaml.Schema.create(customTypeTags);
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
            range: helper.rangeFromLineNumber(TextEditor, line, column),
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
