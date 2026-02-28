'use strict';

const {describe, it, expect, beforeEach, afterEach} = require('@jest/globals');

function createCommander() {
  jest.resetModules();
  const commander = require('../utils/command');
  const exits = [];
  commander.exitOverride(err => {
    exits.push(err);
  });
  return {commander, exits};
}

describe('MiniCommander', () => {
  let stdoutSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('displays help and version', () => {
    const {commander, exits} = createCommander();
    commander.usage('[file]');
    commander.description('test description');
    commander.version('1.2.3');

    commander.parse(['node', '/tmp/cli.js', '--help']);
    expect(exits[0].code).toBe('commander.helpDisplayed');
    expect(exits[0].exitCode).toBe(0);
    expect(stdoutSpy).toHaveBeenCalled();

    commander.parse(['node', '/tmp/cli.js', '--version']);
    expect(exits[1].code).toBe('commander.version');
    expect(exits[1].exitCode).toBe(0);
  });

  it('handles unknown and missing arguments', () => {
    const {commander, exits} = createCommander();
    commander.option('-f, --file <path>', 'file path');

    commander.parse(['node', '/tmp/cli.js', '--unknown']);
    expect(exits[0].code).toBe('commander.unknownOption');
    expect(exits[0].message).toContain('--unknown');

    commander.parse(['node', '/tmp/cli.js', '--file']);
    expect(exits[1].code).toBe('commander.missingArgument');
    expect(exits[1].message).toContain('--file');
  });

  it('parses long options, no-* options and positional args', () => {
    const {commander} = createCommander();
    let capturedArg;
    let capturedOptions;

    commander
      .option('--name <value>', 'name')
      .option('--tag [value]', 'tag')
      .option('--no-sort', 'disable sort')
      .action((arg, options) => {
        capturedArg = arg;
        capturedOptions = options;
      });

    commander.parse(['node', '/tmp/cli.js', 'input.yaml', '--name=alice', '--tag', 'beta', '--no-sort']);

    expect(capturedArg).toBe('input.yaml');
    expect(capturedOptions).toMatchObject({
      name: 'alice',
      tag: 'beta',
      sort: false
    });
  });

  it('parses short options, including grouped flags and attached values', () => {
    const {commander} = createCommander();
    let capturedOptions;

    commander
      .option('-v, --verbose', 'verbose')
      .option('-n, --number <num>', 'number', 7)
      .action((arg, options) => {
        capturedOptions = options;
      });

    commander.parse(['node', '/tmp/cli.js', 'input.yaml', '-vn5']);
    expect(capturedOptions).toMatchObject({verbose: true, number: 5});

    commander.parse(['node', '/tmp/cli.js', 'input.yaml', '-n', 'not-a-number']);
    expect(capturedOptions.number).toBe(7);
  });

  it('uses parser functions with previous values and keeps default ordering behavior', () => {
    const {commander} = createCommander();
    let capturedOptions;

    commander
      .option(
        '--include [value]',
        'include values',
        (value, previous) => {
          const list = Array.isArray(previous) ? previous : [];
          return value === undefined ? list : list.concat(value);
        },
        []
      )
      .action((arg, options) => {
        capturedOptions = options;
      });

    commander.parse(['node', '/tmp/cli.js', 'input.yaml', '--include', 'a', '--include', 'b']);

    expect(capturedOptions.include).toStrictEqual(['a', 'b']);
    expect(Object.keys(capturedOptions)).toContain('include');
  });

  it('handles async action rejection by exiting with error code', async () => {
    const {commander, exits} = createCommander();

    commander.action(async () => {
      throw new Error('boom');
    });

    commander.parse(['node', '/tmp/cli.js', 'input.yaml']);

    await new Promise(resolve => setImmediate(resolve));
    expect(exits[0].code).toBe('commander.asyncActionRejected');
    expect(exits[0].exitCode).toBe(1);
  });

  it('handles unknown short options', () => {
    const {commander, exits} = createCommander();
    commander.parse(['node', '/tmp/cli.js', '-z']);
    expect(exits[0].code).toBe('commander.unknownOption');
    expect(exits[0].message).toContain("'-z'");
  });
});
