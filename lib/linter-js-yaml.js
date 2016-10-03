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
    customCloudformationTags: {
      type: 'array',
      default: [
        // {"name": "!Base64", "kind": 'mapping'},
        // {"name": "!Equals"}
        // "!Base64",
        // "!Equals",
        // "!GetAtt",
        // "!If",
        // "!Ref",
        // "!Sub",
      ],
      items: {
        type: 'string',
      },
      description: 'List of YAML Custom Cloudformation Tags',
    },
  },

  buildCfTags() {
    let cloudformationMappingTags = [
      "!Base64Real",
    ];
    let cloudformationSequenceTags = [
      "!And",
      "!Equals",
      "!GetAtt",
      "!If",
      "!FindInMap",
      "!Join",
      "!Not",
      "!Or",
      "!Select",
    ];
    let cloudformationScalarTags = [
      "!Ref",
      "!Sub",
      "!GetAZs",
      "!GetAtt",
      "!ImportValue",
      "!Condition",
    ];
    let cloudformationTags = [];
    cloudformationMappingTags.map(tag => cloudformationTags.push(new yaml.Type(tag, {kind: 'mapping'})));
    cloudformationSequenceTags.map(tag => cloudformationTags.push(new yaml.Type(tag, {kind:'sequence'})));
    cloudformationScalarTags.map(tag => cloudformationTags.push(new yaml.Type(tag, {kind:'scalar'})));
    // return yaml.Schema.create(cloudformationTags);
    return cloudformationTags;
  },

  activate() {
    require('atom-package-deps').install('linter-js-yaml');
    let cloudformationTags = this.buildCfTags();



    // this.Schema = yaml.Schema.create(cloudformationSequenceTags.map(tag =>
    //   new yaml.Type(tag, { kind: 'sequence'});
    // ));
    // this.Schema = yaml.Schema.create(cloudformationScalarTags.map(tag =>
    //   new yaml.Type(tag, { kind: 'scalar' });
    // ));

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-js-yaml.customTags', (customTags) => {
      // defaultTagSchema = yaml.Schema.create(this.buildCfTags());
      customTags.map(tag => {
        if (typeof tag === 'object')
          cloudformationTags.push(new yaml.Type(tag.name, { kind: tag.kind || 'scalar' }));
        if (typeof tag === 'string')
          cloudformationTags.push(new yaml.Type(tag, {kind: 'scalar'}));
      });
      // this.Schema = yaml.Schema.create(customTags.map(tag =>
      //   new yaml.Type(tag.name, { kind: tag.kind || 'scalar' })
      // ));
      this.Schema = yaml.Schema.create(cloudformationTags);
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
