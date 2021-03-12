# openapi-format

Format the fields of OpenAPI fields by ordering them in a hierarchical order.

The openapi-format loads an OpenAPI file, sorts the OpenAPI fields by ordering them in a hierarchical order, and can
output the file with clean indenting, to either JSON or YAML.

## Features

- [x] Format OpenAPI fields in a desired order.
- [x] Order OpenAPI fields in a custom order.
- [x] Format via CLI.
- [x] Use via as Module.
- [x] Support for OpenAPI 3.0
- [ ] Support for OpenAPI 3.1
- [ ] Support for OpenAPI 3.1

## Installation

### Local Installation (recommended)

While possible to install globally, we recommend that you, if possible, add the converter to the `node_modules` of your test project using:

```shell
$ npm install --save openapi-format

# or using yarn...

$ yarn add openapi-format
```

Note that this will require you to run the converter with `npx openapi-format your-openapi-file.yaml` or, if you are using an older versions of npm, `./node_modules/.bin/openapi-format your-openapi-file.yaml`.

### Global Installation

```shell
$ npm install -g openapi-format
```

### NPX usage

To use the CLI without installing it via npm, use the npx method

```shell
$ npx openapi-format your-openapi-file.yaml

```

## Command Line Interface

```
openapi-format.js <input-file> -o [ouptut-file] [options]

Arguments:
  infile   the OpenAPI document, can be either a .json or .yaml file
  outfile  the output file is optional and be either a .json or .yaml file. Files that end in `.json` will be formatted 
  as JSON files that end in `.yaml` or `.yml` will be YAML format
  

Options:

  -o, --output     save the formated file as JSON/YAML                    [path]
  
  --json           prints the file to stdout as JSON                   [boolean]
  --json           prints the file to stdout as YAML                   [boolean]
  --no-sort        Doesn't sort the file                               [boolean]

  --sortFile       The file to specify customer OpenAPI fields ordering   [path]
  --configFile     The file with the format config options                [path]
  --help           Show help                                           [boolean]
  --verbose        Output more details of the filter process             [count]
```

### Examples

Formats/sorts a spec and saves it as a new file

```shell
$ openapi-format openapi.json openapi-formatted.json
```

Formats/sorts a spec and output it to STDOUT

```shell
$ openapi-format openapi.json
```

Formats/sorts a spec and saves it as a yaml file.

```shell
$ openapi-format openapi.json openapi.yaml
```

Formats (doesn't sort) a spec and saves it as a yaml file.

```shell
$ openapi-format openapi.json openapi.yaml --no-sort
```

## Credits

This package is inspired by
the [@microsoft.azure/format-spec](https://www.npmjs.com/package/@microsoft.azure/format-spec) from @fearthecowboy. The
original code was not available on Github, with the last update was 3 years ago, so to improve support and extend it we
tried to reproduce the original functionality.
