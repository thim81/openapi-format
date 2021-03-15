# openapi-format

Format OpenAPI documents by providing options to sort OpenAPI fields in a hierarchical order, filter out specific flags,
tags, methods,operationID's and the option to rename of the OpenAPI title

The openapi-format loads an OpenAPI file, sorts the OpenAPI fields by ordering them in a hierarchical order, and can
output the file with clean indenting, to either JSON or YAML.

## Features

- [x] Order OpenAPI fields in a desired order.
- [x] Order OpenAPI fields in a custom order.
- [x] Filter OpenAPI files based on methods
- [x] Filter OpenAPI files based on flags
- [x] Filter OpenAPI files based on tags
- [x] Filter OpenAPI files based on operationID's
- [x] Rename the OpenAPI title
- [x] Support OpenAPI documents in JSON format.
- [x] Support OpenAPI documents in YAML format.
- [x] Format via CLI.
- [x] Format via config files
- [x] Use via as Module.
- [x] Support for OpenAPI 3.0
- [ ] Support for OpenAPI 3.1

## Installation

### Local Installation (recommended)

While possible to install globally, we recommend that you, if possible, add the converter to the `node_modules` of your
test project using:

```shell
$ npm install --save openapi-format
```

or using yarn...

```shell
$ yarn add openapi-format
```

Note that this will require you to run the converter with `npx openapi-format your-openapi-file.yaml` or, if you are
using an older versions of npm, `./node_modules/.bin/openapi-format your-openapi-file.yaml`.

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

  -o, --output     Save the formated OpenAPI file as JSON/YAML            [path]
  
  --sortFile       The file to specify custom OpenAPI fields ordering     [path]
  --filterFile     The file to specify filter setting                     [path]
    
  --no-sort        Don't sort the file                                 [boolean]
  --rename         Rename the OpenAPI title                             [string]

  --configFile     The file with all the format config options            [path]
  
  --json           Prints the file to stdout as JSON                   [boolean]
  --yaml           Prints the file to stdout as YAML                   [boolean]
  
  --help           Show help                                           [boolean]
  --verbose        Output more details of the filter process             [count]
```

### OpenAPI format options

| Parameter    | Alias         | Description                                                                 | Input type   | Default          | Required/Optional |
|--------------|---------------|-----------------------------------------------------------------------------|--------------|------------------|-------------------|
| file         |               | the original OpenAPI file                                                   | path to file |                  | required          |
| --output     | -o            | save the formatted OpenAPI file as JSON/YAML                                | path to file |                  | optional          |
| --sortFile   | -s            | the file to specify custom OpenAPI fields ordering                          | path to file | defaultSort.json | optional          |
| --filterFile | -f            | the file to specify filter setting                                          | path to file |                  | optional          |
| --no-sort    |               | don't sort the file                                                         | boolean      | FALSE            | optional          |
| --rename     |               | rename the OpenAPI title                                                    | string       |                  | optional          |
| --configFile | -c            | the file with all the format config options                                 | path to file |                  | optional          |
| --json       |               | prints the file to stdout as JSON                                           |              | FALSE            | optional          |
| --yaml       |               | prints the file to stdout as YAML                                           |              | FALSE            | optional          |
| --verbose    | -v, -vv, -vvv | verbosity that can be increased, which will show more output of the process |              |                  | optional          |
| --help       | h             | display help for command                                                    |              |                  | optional          |

### OpenAPI sort configuration options

The default sorting based on the following logic, which is stored in the `defaultSort.json` file. You can easily modify 
this by specifying your own ordering per key, which can passed on to the CLI (see below for an example on how to do this
).

| Key         | Ordered by                                                                                                        | OpenAPI reference                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| root        | x - openapi<br>\- info<br>\- servers<br>\- paths<br>\- components<br>\- tags<br>\- x-tagGroups<br>\- externalDocs | "OpenAPI Objec" https://swagger.io/specification/#openapi-object                                               |
| get         | x - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | "Path Item Object" https://swagger.io/specification/#path-item-object                                          |
| post        | x - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | "Path Item Object" https://swagger.io/specification/#path-item-object                                          |
| put         | x - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | "Path Item Object" https://swagger.io/specification/#path-item-object                                          |
| patch       | x - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | "Path Item Object" https://swagger.io/specification/#path-item-object                                          |
| delete      | x - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | "Path Item Object" https://swagger.io/specification/#path-item-object                                          |
| parameters  | x - name<br>\- in<br>\- description<br>\- required<br>\- schema                                                   | [https://swagger.io/specification/#parameter-object](https://swagger.io/specification/#parameter-object)       |
| requestBody | x- description<br>\- headers<br>\- content<br>\- links                                                            | [https://swagger.io/specification/#request-body-object](https://swagger.io/specification/#request-body-object) |
| responses   | x- description<br>\- headers<br>\- content<br>\- links                                                            | [https://swagger.io/specification/#responses-object](https://swagger.io/specification/#responses-object)       |
| content     | By alfabeth                                                                                                       | https://swagger.io/specification/#responses-object                                                             |
| components  | x- parameters<br>\- schemas                                                                                       | https://swagger.io/specification/#components-object                                                            |
| schema      | x- description<br>\- type<br>\- items<br>\- properties<br>\- format<br>\- example<br>\- default                   | https://swagger.io/specification/#schema-object                                                                |
| schemas     | x- description<br>\- type<br>\- items<br>\- properties<br>\- format<br>\- example<br>\- default                   |                                                                                                                |
| properties  | x- description<br>\- type<br>\- items<br>\- format<br>\- example<br>\- default<br>\- enum                         |                                                                                                                |

### OpenAPI filter options

| Key          | Description                   | Type  | Examples                         |
|--------------|-------------------------------|-------|----------------------------------|
| methods      | a list OpenAPI methods.       | array | ['get','post','put']             |
| tags         | a list OpenAPI tags.          | array | ['pet','user']                   |
| operationIds | a list OpenAPI operation ID's.| array | ['findPetsByStatus','updatePet'] |
| flags        | a list of custom flags        | array | ['x-exclude','x-internal']       |

Some more details on the keys:

- **methods**: Refers to the "Path Item Object" https://swagger.io/specification/#path-item-object

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
            summary: Finds Pets by status
        put:
            summary: Update an existing pet
```  

- **tags**: Refers to the "tags" field from the "Operation Object" https://swagger.io/specification/#operation-object

For example:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        put:
            tags:
                - pet
            summary: Update an existing pet
```  

- **operationIds**: Refers to the "operationId" field from the "Operation
  Object" https://swagger.io/specification/#operation-object

For example:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
            operationId: findPetsByStatus
```

- **flags**: Refers to a custom property which can be set on any field in the OpenAPI document.

For example:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
            x-exclude: true
```

### CLI sort usage

#### Format a spec with the default sorting and saves it as a new JSON file

```shell
$ openapi-format openapi.json openapi-formatted.json
```

#### Format a OpenAPI document with the default sorting and saves it as a new YAML file

```shell
$ openapi-format openapi.json openapi.yaml
```

#### Format a OpenAPI document with the default sorting and output it as JSON to STDOUT

```shell
$ openapi-format openapi.json --json
```

#### Format a OpenAPI document with the default sorting and output it as YAML to STDOUT

```shell
$ openapi-format openapi.json --yaml
```

#### Format a OpenAPI document with the default sorting and output it as YAML to STDOUT

```shell
$ openapi-format openapi.json openapi.yaml
```

#### Format a OpenAPI document but skip the sorting and saves it as a new JSON file

example:

```shell
$ openapi-format openapi.json openapi.json --no-sort
```

Which should keep the OpenAPI fields in the same order. This can be needed, when you only want to do a filtering or
rename action.

### OpenAPI options

### CLI filter usage

#### Format a OpenAPI document by filtering fields, default sorting and saves it as a new file

When you want to strip certain flags, tags, methods, operationID's, you can pass a `filterFile` which contains the
specific values for the flags, tags, methods, operationID's.

This can be useful to combine with the sorting, to end-up with an order and filtered OpenAPI document.

example:

```shell
$ openapi-format openapi.json openapi-formatted.json --filter customFilter.yaml
```

where the `customFilter.yaml` would contain a combination of all the elements you want to filter out.

```yaml
flags:
    - x-visibility
flagValues: [ ]
tags: [ ]
operationIds:
    - addPet
    - findPetsByStatus
```

### CLI rename usage

#### Format a OpenAPI document by changing the title and saves it as a new JSON file

During CI/CD pipelines, you might want to create different results of the OpenAPI document. Having the option to rename
them, might make it easier to work with the results, so that is why we provide this command option.

```shell
$ openapi-format openapi.json openapi.json --rename "OpenAPI Petstore - OpenAPI 3.0"
```

which results in

- before

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "Swagger Petstore - OpenAPI 3.0",
```

- after

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "Swagger Petstore - OpenAPI 3.0",
```

### CLI configuration usage

All the CLI options can be managed in separate configuration file and passed along the openapi-format command. This will
make configuration easier, especially in CI/CD implementations where the configuration can be stored in version control
systems.

example:

```shell
$ openapi-format openapi.json --configFil openapi-format-options.json
```

The formatting will happen based on all the options set in the `openapi-format-options.json` file. All the options
defined in the

## Credits

This package is inspired by
the [@microsoft.azure/format-spec](https://www.npmjs.com/package/@microsoft.azure/format-spec) from @fearthecowboy. The
original code was not available on Github, with the last update was 3 years ago, so to improve support and extend it we
tried to reproduce the original functionality.
