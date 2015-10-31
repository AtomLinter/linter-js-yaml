'use babel';

describe('Js-YAML provider for Linter', () => {
  const lint = require('../lib/linter-js-yaml.js').provideLinter().lint;

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.packages.activatePackage('linter-js-yaml').then(() => {
        atom.config.set('linter-js-yaml.customTags', ['!yaml', '!include']);
      });
    });
  });

  it('bad.yaml', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/bad.yaml').then(editor => {
        const messages = lint(editor);
        expect(messages.length).toEqual(1);
        expect(messages[0].type).toEqual('Error');
        expect(messages[0].text).toEqual('end of the stream or a document separator is expected');
        expect(messages[0].filePath).toMatch(/.+bad\.yaml$/);
        expect(messages[0].range).toEqual([[2, 4], [2, 5]]);
      });
    });
  });

  it('issue-2.yaml', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/issue-2.yaml').then(editor => {
        const messages = lint(editor);
        expect(messages.length).toEqual(0);
      });
    });
  });

  it('ssue-9.yaml', () => {
    waitsForPromise(() => {
      return atom.workspace.open(__dirname + '/files/issue-9.yaml').then(editor => {
        const messages = lint(editor);
        expect(messages.length).toEqual(0);
      });
    });
  });
});
