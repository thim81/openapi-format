'use strict';

const {describe, it, expect, beforeEach, afterEach} = require('@jest/globals');
const {infoOut, logOut, debugOut, infoTable} = require('../utils/logging');

describe('logging utils', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('infoOut should write warnings', () => {
    infoOut('hello');
    expect(warnSpy).toHaveBeenCalledWith('hello');
  });

  it('logOut should respect verbose level', () => {
    logOut('quiet', 0);
    expect(warnSpy).not.toHaveBeenCalled();

    logOut('loud', 1);
    expect(warnSpy).toHaveBeenCalledWith('loud');
  });

  it('debugOut should write only for verbose level >= 2', () => {
    debugOut('nope', 1);
    expect(warnSpy).not.toHaveBeenCalled();

    debugOut('yep', 2);
    expect(warnSpy).toHaveBeenCalledWith('yep');
  });

  it('infoTable should render table in verbose mode', () => {
    const table = infoTable({a: '1', b: ['x', 'y']}, 1);
    expect(table).toContain('| a | 1    |');
    expect(table).toContain('| b | x, y |');
  });
});
