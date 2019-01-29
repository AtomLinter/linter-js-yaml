'use babel';

import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';
import * as path from 'path';

const badPath = path.join(__dirname, 'files', 'bad.yaml');
const issue2Path = path.join(__dirname, 'files', 'issue-2.yaml');
const issue9Path = path.join(__dirname, 'files', 'issue-9.yaml');
const wrongNodeKind = path.join(__dirname, 'files', 'wrong-node-kind.yaml');
const nodeKinds = path.join(__dirname, 'files', 'node-kinds.yaml');

describe('Js-YAML provider for Linter', () => {
  const { lint } = require('../lib/linter-js-yaml.js').provideLinter();

  beforeEach(async () => {
    // Info about this beforeEach() implementation:
    // https://github.com/AtomLinter/Meta/issues/15
    const activationPromise = atom.packages.activatePackage('linter-js-yaml');

    await atom.packages.activatePackage('language-yaml');
    await atom.workspace.open(badPath);

    atom.packages.triggerDeferredActivationHooks();
    await activationPromise;
    atom.config.set('linter-js-yaml.customTags', ['!yaml', '!include']);
  });

  it('finds something wrong with bad.yaml', async () => {
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe('end of the stream or a document separator is expected');
    expect(messages[0].location.file).toBe(badPath);
    expect(messages[0].location.position).toEqual([[2, 4], [2, 5]]);
  });

  it('finds nothing wrong with issue-2.yaml.', async () => {
    const editor = await atom.workspace.open(issue2Path);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('finds nothing wrong with issue-9.yaml.', async () => {
    const editor = await atom.workspace.open(issue9Path);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('finds nothing wrong with issue-9.yaml.', () => waitsForPromise(() => (
    atom.workspace.open(issue9Path).then((editor) => {
      const messages = lint(editor);
      expect(messages.length).toEqual(0);
    })
  )));

  describe('with node kinds in customTags', () => {
    beforeEach(() => atom.config.set('linter-js-yaml.customTags', [
      '!yaml scalar', '!delta mapping', '!epsilon sequence',
    ]));

    it('finds something wrong with wrong-node-kind.yaml', () => {
      waitsForPromise(() => atom.workspace.open(wrongNodeKind).then((editor) => {
        const messages = lint(editor);
        expect(messages.length).toBe(1);
        expect(messages[0].severity).toBe('error');
        expect(messages[0].excerpt).toBe('unknown tag !<!epsilon>');
        expect(messages[0].location.file).toBe(wrongNodeKind);
        expect(messages[0].location.position).toEqual([[2, 34], [2, 34]]);
      }));
    });

    it('finds nothing wrong with node-kinds.yaml.', () => {
      waitsForPromise(() => atom.workspace.open(nodeKinds).then((editor) => {
        const messages = lint(editor);
        expect(messages.length).toBe(0);
      }));
    });
  });
});
