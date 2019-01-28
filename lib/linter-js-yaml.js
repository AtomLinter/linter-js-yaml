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
      description: 'List of YAML custom tags, each optionally followed by a space and the node kind (scalar, mapping, or sequence).',
    },
  },

  activate() {
    require('atom-package-deps').install('linter-js-yaml');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-js-yaml.customTags', (customTags) => {
      this.Schema = yaml.Schema.create(customTags.map((tag) => {
        const typeInfo = tag.split(' ');
        return new yaml.Type(typeInfo[0], { kind: typeInfo[1] || 'scalar' });
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
      lintsOnChange: true,
      lint: (TextEditor) => {
        if (!atom.workspace.isTextEditor(TextEditor)) {
          return null;
        }
        const filePath = TextEditor.getPath();
        if (!filePath) {
          // Invalid path
          return null;
        }
        const fileText = TextEditor.getText();

        const messages = [];
        const processMessage = (severity, message) => {
          let { line } = message.mark;
          // Workaround for https://github.com/nodeca/js-yaml/issues/218
          const maxLine = TextEditor.getLineCount() - 1;
          if (line > maxLine) {
            line = maxLine;
          }
          const { column } = message.mark;
          return {
            severity,
            excerpt: message.reason,
            location: {
              file: filePath,
              position: helper.generateRange(TextEditor, line, column),
            },
          };
        };

        try {
          yaml.safeLoadAll(fileText, () => ({}), {
            filename: path.basename(filePath),
            schema: this.Schema,
            onWarning: (warning) => {
              messages.push(processMessage('warning', warning));
            },
          });
        } catch (error) {
          messages.push(processMessage('error', error));
        }

        return messages;
      },
    };
  },
};
