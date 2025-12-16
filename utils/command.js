const path = require('path');

class MiniCommander {
  constructor() {
    this._usage = '';
    this._description = '';
    this._argumentDescription = '';
    this._options = [];
    this._actionFn = null;
    this._exitHandler = null;
    this._programName = null;
    this._version = null;
    this._helpAdded = false;
    this._longLookup = new Map();
    this._shortLookup = new Map();
  }

  arguments(desc) {
    this._argumentDescription = desc;
    return this;
  }

  usage(usage) {
    this._usage = usage;
    return this;
  }

  description(text) {
    this._description = text;
    return this;
  }

  option(flags, description, parserOrDefault, maybeDefault) {
    const option = this._createOption(flags, description);

    if (typeof parserOrDefault === 'function') {
      option.parser = parserOrDefault;
      option.defaultValue = maybeDefault;
      option.showDefault = arguments.length === 4;
    } else if (parserOrDefault !== undefined) {
      option.defaultValue = parserOrDefault;
      option.showDefault = true;
    }

    if (option.negate) {
      option.defaultValue = true;
      option.showDefault = false;
    }

    this._registerOption(option);
    this._options.push(option);
    return this;
  }

  version(version, flag = '--version') {
    this._version = version;
    const option = this._createOption(flag, 'output the version number');
    option.isVersion = true;
    this._registerOption(option);
    this._options.push(option);
    return this;
  }

  action(fn) {
    this._actionFn = fn;
    return this;
  }

  exitOverride(fn) {
    this._exitHandler = fn;
    return this;
  }

  outputHelp() {
    process.stdout.write(this._buildHelp());
    return this;
  }

  parse(argv) {
    this._ensureHelpOption();
    this._programName = this._programName || this._deriveName(argv);

    const state = this._initialState();
    const tokens = argv.slice(2);

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token === '--') {
        state.args.push(...tokens.slice(i + 1));
        break;
      }

      if (token.startsWith('--')) {
        const consumed = this._parseLongOption(token, tokens, i, state);
        if (consumed > 0) {
          i += consumed;
        }
        continue;
      }

      if (token.startsWith('-') && token !== '-') {
        const consumed = this._parseShortOption(token, tokens, i, state);
        if (consumed > 0) {
          i += consumed;
        }
        continue;
      }

      state.args.push(token);
    }

    if (state.displayHelp) {
      this.outputHelp();
      this._terminate(0, 'commander.helpDisplayed');
      return this;
    }

    if (state.displayVersion) {
      process.stdout.write(`${this._version}\n`);
      this._terminate(0, 'commander.version');
      return this;
    }

    if (this._actionFn) {
      const orderedOptions = this._orderedOptions(state.options);
      const actionResult = this._actionFn(state.args[0], orderedOptions);
      if (actionResult && typeof actionResult.then === 'function') {
        actionResult.catch(err => {
          if (err) {
            console.error(err);
          }
          this._terminate(1, 'commander.asyncActionRejected');
        });
      }
    }

    return this;
  }

  _initialState() {
    return {
      options: {},
      args: [],
      displayHelp: false,
      displayVersion: false
    };
  }

  _parseLongOption(token, tokens, index, state) {
    const [flag, valueFromEquals] = token.split('=');
    const option = this._longLookup.get(flag);
    if (!option) {
      this._unknownOption(flag);
      return 0;
    }

    if (option.isHelp) {
      state.displayHelp = true;
      return 0;
    }

    if (option.isVersion) {
      state.displayVersion = true;
      return 0;
    }

    if (option.negate) {
      this._setOption(option, false, state);
      return 0;
    }

    if (option.argRequired || option.argOptional) {
      let value = valueFromEquals;
      let extra = 0;
      if (value === undefined) {
        const nextToken = tokens[index + 1];
        const nextIsOption = !nextToken || nextToken.startsWith('-');
        if (!nextIsOption) {
          value = nextToken;
          extra = 1;
        } else if (option.argRequired) {
          this._missingArgument(option, flag);
          return 0;
        }
      }
      this._setOption(option, value, state);
      return extra;
    }

    this._setOption(option, true, state);
    return 0;
  }

  _parseShortOption(token, tokens, index, state) {
    const chars = token.slice(1).split('');
    let extraConsumed = 0;

    for (let i = 0; i < chars.length; i += 1) {
      const shortFlag = `-${chars[i]}`;
      const option = this._shortLookup.get(shortFlag);
      if (!option) {
        this._unknownOption(shortFlag);
        return extraConsumed;
      }

      if (option.isHelp) {
        state.displayHelp = true;
        continue;
      }

      if (option.isVersion) {
        state.displayVersion = true;
        continue;
      }

      if (option.negate) {
        this._setOption(option, false, state);
        continue;
      }

      if (option.argRequired || option.argOptional) {
        let value = chars.slice(i + 1).join('');
        let consumedNextToken = false;
        if (!value) {
          const nextToken = tokens[index + 1];
          const nextIsOption = !nextToken || nextToken.startsWith('-');
          if (!nextIsOption) {
            value = nextToken;
            extraConsumed += 1;
            consumedNextToken = true;
          } else if (option.argRequired) {
            this._missingArgument(option, shortFlag);
            return extraConsumed;
          }
        }
        this._setOption(option, value, state);
        if (!consumedNextToken) {
          break;
        }
        return extraConsumed;
      }

      this._setOption(option, true, state);
    }

    return extraConsumed;
  }

  _setOption(option, rawValue, state) {
    if (option.isHelp || option.isVersion) {
      return;
    }

    let value = rawValue;
    if (option.argRequired || option.argOptional) {
      if (value === undefined && option.argRequired) {
        this._missingArgument(option, option.long || option.short);
        return;
      }
    }

    if (value !== undefined && option.defaultValue !== undefined && typeof option.defaultValue === 'number') {
      const parsed = Number(value);
      value = Number.isNaN(parsed) ? option.defaultValue : parsed;
    }

    if (option.parser) {
      const hasPrevious = Object.prototype.hasOwnProperty.call(state.options, option.key);
      const previous = hasPrevious
        ? state.options[option.key]
        : option.defaultValue !== undefined
          ? option.defaultValue
          : undefined;
      value = option.parser(value, previous);
    } else if (!option.argRequired && !option.argOptional) {
      value = Boolean(value);
    }

    state.options[option.key] = value;
  }

  _createOption(flags, description) {
    const parts = flags.split(',').map(part => part.trim());
    const option = {
      short: null,
      long: null,
      description,
      parser: null,
      defaultValue: undefined,
      showDefault: false,
      negate: false,
      argRequired: false,
      argOptional: false,
      key: '',
      helpLabel: flags.trim(),
      isHelp: false,
      isVersion: false
    };

    parts.forEach(part => {
      const match = part.match(/(<.*?>|\[.*?\])/);
      if (match) {
        option.argRequired = match[0].startsWith('<');
        option.argOptional = match[0].startsWith('[');
      }
      const flag = part.replace(/(<.*?>|\[.*?\])/g, '').trim();
      if (flag.startsWith('--')) {
        option.long = flag;
      } else if (flag.startsWith('-')) {
        option.short = flag;
      }
    });

    if (option.long && option.long.startsWith('--no-')) {
      option.negate = true;
      option.key = this._flagToKey(option.long.replace('--no-', ''));
    } else if (option.long) {
      option.key = this._flagToKey(option.long.replace('--', ''));
    } else if (option.short) {
      option.key = this._flagToKey(option.short.replace('-', ''));
    }

    return option;
  }

  _flagToKey(flag) {
    return flag.split('-').reduce((acc, segment, index) => {
      if (index === 0) {
        return segment;
      }
      return acc + segment.charAt(0).toUpperCase() + segment.slice(1);
    }, '');
  }

  _registerOption(option) {
    if (option.long) {
      this._longLookup.set(option.long, option);
    }
    if (option.short) {
      this._shortLookup.set(option.short, option);
    }
  }

  _ensureHelpOption() {
    if (this._helpAdded) {
      return;
    }

    const option = this._createOption('-h, --help', 'display help for command');
    option.isHelp = true;
    this._registerOption(option);
    this._options.push(option);
    this._helpAdded = true;
  }

  _deriveName(argv) {
    const executable = argv[1] ? path.basename(argv[1]) : 'cli';
    return executable || 'cli';
  }

  _buildHelp() {
    const usage = `Usage: ${this._programName || 'cli'} ${this._usage}`.trim();
    const sections = [usage, '', this._description, '', 'Options:'];
    const helpOptions = this._options.filter(opt => !opt.isHidden);
    const labelWidth = helpOptions.length ? Math.max(...helpOptions.map(opt => opt.helpLabel.length)) : 0;

    helpOptions.forEach(option => {
      let line = option.description;
      if (option.showDefault && option.defaultValue !== undefined) {
        line += ` (default: ${option.defaultValue})`;
      }
      sections.push(`  ${option.helpLabel.padEnd(labelWidth + 2)}${line}`);
    });

    sections.push('');
    return sections.join('\n');
  }

  _unknownOption(flag) {
    const err = new Error(`error: unknown option '${flag}'`);
    err.code = 'commander.unknownOption';
    err.exitCode = 1;
    this._handleError(err);
  }

  _missingArgument(option, flag) {
    const err = new Error(`error: option '${flag}' argument missing`);
    err.code = 'commander.missingArgument';
    err.exitCode = 1;
    this._handleError(err);
  }

  _terminate(exitCode, code) {
    const err = new Error();
    err.exitCode = exitCode;
    err.code = code;
    if (code === 'commander.helpDisplayed' || code === 'commander.version') {
      this._handleError(err);
    } else {
      this._handleError(err);
    }
  }

  _handleError(err) {
    if (this._exitHandler) {
      this._exitHandler(err);
      return;
    }
    if (err && err.message) {
      process.stderr.write(`${err.message}\n`);
    }
    process.exit(err.exitCode || 1);
  }

  _orderedOptions(options) {
    const ordered = {};

    this._options.forEach(option => {
      if (!option.key || option.isHelp || option.isVersion) {
        return;
      }
      if (option.defaultValue !== undefined) {
        if (option.parser) {
          Object.defineProperty(ordered, option.key, {
            value: option.defaultValue,
            enumerable: false,
            writable: true,
            configurable: true
          });
        } else {
          ordered[option.key] = option.defaultValue;
        }
      }
    });

    Object.keys(options).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(ordered, key)) {
        const descriptor = Object.getOwnPropertyDescriptor(ordered, key);
        if (descriptor && descriptor.enumerable === false) {
          delete ordered[key];
          ordered[key] = options[key];
        } else {
          ordered[key] = options[key];
        }
      } else {
        ordered[key] = options[key];
      }
    });

    return ordered;
  }
}

module.exports = new MiniCommander();
