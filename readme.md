# openapi-format

Format an OpenAPI document by ordering and filtering fields.

The openapi-format CLI can load an OpenAPI file, sorts the OpenAPI fields by ordering them in a hierarchical order, and
can output the file with clean indenting, to either JSON or YAML.

Next to the ordering, the CLI provides additional options to filter fields & parts of the OpenAPI document based on
flags, tags, methods, operationID's and even unused components.

<a href="https://www.npmjs.com/package/openapi-format" alt="Latest Stable Version">![npm](https://img.shields.io/npm/v/openapi-format.svg)</a> 
<a href="https://www.npmjs.com/package/openapi-format" alt="Total Downloads">![npm](https://img.shields.io/npm/dw/openapi-format.svg)</a>

## Table of content
* [Use-cases](#use-cases)
* [Features](#features)
* [Installation](#installation)
    + [Local Installation (recommended)](#local-installation--recommended-)
    + [Global Installation](#global-installation)
    + [NPX usage](#npx-usage)
* [Command Line Interface](#command-line-interface)
* [OpenAPI format options](#openapi-format-options)
* [OpenAPI sort configuration options](#openapi-sort-configuration-options)
* [OpenAPI filter options](#openapi-filter-options)
* [CLI sort usage](#cli-sort-usage)
* [CLI filter usage](#cli-filter-usage)
* [CLI rename usage](#cli-rename-usage)
* [CLI configuration usage](#cli-configuration-usage)
* [Credits](#credits)

## Use-cases

**Public documentation:**
An OpenAPI document is a specification that evolves and changes. To facilitate working with the specification and publishing the
document as public documentation, you want to deliver a clean and structured specification. OpenAPI-format helps you to
organize the fields by sorting and filtering specific elements from the OpenAPI like internal endpoints, beta tags, ...
and even unused schemas, examples, responses, ... with a clean and optimized OpenAPI document as a result.

**Maintenance:**
When working on large OpenAPI documents or with multiple team members, the file can be become messy and difficult to
compare changes. By sorting it from time to time, the fields are all ordered in a structured manner, which will help you
to maintain the file with greater ease.

**CI/CD pipelines:**
OpenAPI-format can be useful in CI/CD pipelines, where the OpenAPI is used as the source for other documents like Web documentation,
Postman collections, test suites, ...

## Features

- [x] Order OpenAPI fields in a default order
- [x] Order OpenAPI fields in a custom order
- [x] Order Components elements by alphabet
- [x] Format the casing (camelCase,PascalCase, ...) of component elements
- [x] Filter OpenAPI files based on methods
- [x] Filter OpenAPI files based on flags
- [x] Filter OpenAPI files based on flags values
- [x] Filter OpenAPI files based on tags
- [x] Filter OpenAPI files based on operationID's
- [x] Filter OpenAPI files based on operations definition
- [x] Strip flags from OpenAPI files
- [x] Strip unused components from OpenAPI files
- [x] Rename the OpenAPI title
- [x] Support OpenAPI documents in JSON format
- [x] Support OpenAPI documents in YAML format
- [x] Format via CLI
- [x] Format via config files
- [x] Use as a Module
- [x] Aligned YAML parsing style with Stoplight Studio style
- [x] Support for OpenAPI 3.0
- [ ] Support for OpenAPI 3.1

## Installation

### Local Installation (recommended)

While possible to install globally, we recommend that you add the openapi-format CLI to the `node_modules` by using:

```shell
$ npm install --save openapi-format
```

or using yarn...

```shell
$ yarn add openapi-format
```

Note that this will require you to run the openapi-format CLI with `npx openapi-format your-openapi-file.yaml` or, if
you are using an older versions of npm, `./node_modules/.bin/openapi-format your-openapi-file.yaml`.

### Global Installation

```shell
$ npm install -g openapi-format
```

### NPX usage

To execute the CLI without installing it via npm, use the npx method

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

  --output, -o         Save the formated OpenAPI file as JSON/YAML             [path]
  
  --sortFile           The file to specify custom OpenAPI fields ordering      [path]
  --filterFile         The file to specify filter setting                      [path]
    
  --no-sort            Don't sort the OpenAPI file                          [boolean]
  --sortComponentsFile The file with components to sort alphabetically         [path]
  
  --rename             Rename the OpenAPI title                              [string]

  --configFile         The file with all the format config options             [path]
  
  --lineWidth          Max line width of YAML output                         [number]
  
  --json               Prints the file to stdout as JSON                    [boolean]
  --yaml               Prints the file to stdout as YAML                    [boolean]
  
  --help               Show help                                            [boolean]
  --verbose            Output more details of the filter process              [count]
```

## OpenAPI format options

| Parameter             | Alias         | Description                                                                 | Input type   | Default                     | Info      |
|-----------------------|---------------|-----------------------------------------------------------------------------|--------------|-----------------------------|-----------|
| file                  |               | the original OpenAPI file                                                   | path to file |                             | required  |
| --output              | -o            | save the formatted OpenAPI file as JSON/YAML                                | path to file |                             | optional  |
| --sortFile            | -s            | the file to specify custom OpenAPI fields ordering                          | path to file | defaultSort.json            | optional  |
| --filterFile          | -f            | the file to specify filter setting                                          | path to file | defaultFilter.json          | optional  |
| --casingFile          | -c            | the file to specify casing setting                                          | path to file |                             | optional  |
| --no-sort             |               | don't sort the OpenAPI file                                                 | boolean      | FALSE                       | optional  |
| --sortComponentsFile  |               | sort the items of the components (schemas, parameters, ...) by alphabet     | path to file | defaultSortComponents.json  | optional  |
| --rename              |               | rename the OpenAPI title                                                    | string       |                             | optional  |
| --configFile          | -c            | the file with all the format config options                                 | path to file |                             | optional  |
| --lineWidth           |               | max line width of YAML output                                               | number       | -1 (Infinity)               | optional  |
| --json                |               | prints the file to stdout as JSON                                           |              | FALSE                       | optional  |
| --yaml                |               | prints the file to stdout as YAML                                           |              | FALSE                       | optional  |
| --verbose             | -v, -vv, -vvv | verbosity that can be increased, which will show more output of the process |              |                             | optional  |
| --help                | h             | display help for command                                                    |              |                             | optional  |

## OpenAPI sort configuration options

The CLI will sort the OpenAPI document in the defined order liked defined per OpenAPI key/element. The fields that are
not specified will keep their order like it is in the original OpenAPI document, so only defined fields will be
re-ordered.

The default sorting based on the defined order (listed in the table below), which is stored in
the [defaultSort.json](https://github.com/thim81/openapi-format/blob/main/defaultSort.json) file. 

You can easily modify this by specifying your own ordering per key, which can be passed on to the CLI (see below for an
example on how to do this).

| Key         | Ordered by                                                                                                      | OpenAPI reference                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------| ------------------------------------------------------------------------- |
| root        | - openapi<br>\- info<br>\- servers<br>\- paths<br>\- components<br>\- tags<br>\- x-tagGroups<br>\- externalDocs | https://spec.openapis.org/oas/v3.0.3.html#openapi-object                  |
| get         | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | https://spec.openapis.org/oas/v3.0.3.html#operationObject                 |
| post        | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | https://spec.openapis.org/oas/v3.0.3.html#operationObject                 |
| put         | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | https://spec.openapis.org/oas/v3.0.3.html#operationObject                 |
| patch       | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | https://spec.openapis.org/oas/v3.0.3.html#operationObject                 |
| delete      | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | https://spec.openapis.org/oas/v3.0.3.html#operationObject                 |
| parameters  | - name<br>\- in<br>\- description<br>\- required<br>\- schema                                                   | https://spec.openapis.org/oas/v3.0.3.html#parameterObject                 |
| requestBody | - description<br>\- headers<br>\- content<br>\- links                                                           | https://spec.openapis.org/oas/v3.0.3.html#request-body-object             |
| responses   | - description<br>\- headers<br>\- content<br>\- links                                                           | https://spec.openapis.org/oas/v3.0.3.html#responses-object                |
| content     | (By alphabet)                                                                                                   | https://spec.openapis.org/oas/v3.0.3.html#responses-object                |
| components  | - parameters<br>\- schemas                                                                                      | https://spec.openapis.org/oas/v3.0.3.html#components-object               |
| schema      | - description<br>\- type<br>\- items<br>\- properties<br>\- format<br>\- example<br>\- default                  | https://spec.openapis.org/oas/v3.0.3.html#schemaObject                    |
| schemas     | - description<br>\- type<br>\- items<br>\- properties<br>\- format<br>\- example<br>\- default                  |                                                                           |
| properties  | - description<br>\- type<br>\- items<br>\- format<br>\- example<br>\- default<br>\- enum                        |                                                                           |

## OpenAPI casing configuration options

The CLI can change the casing of the properties/keys/names for the different elements in the OpenAPI document. 
The desired casing can be defined per OpenAPI key/element (see list below).
The keys that are not specified will keep their casing like it is in the original OpenAPI document, so only for defined fields the casing will be changed.

| Key                       | Description                                                                    | OpenAPI reference                                                         |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| operationId               | Changes operation ID's that are part of the Operations Object                  | https://spec.openapis.org/oas/v3.0.3.html#operation-object                |
| properties                | Changes property keys of the schemas from the components/response/requestBody  | https://spec.openapis.org/oas/v3.0.3.html#schemaObject                    |
| parametersPath            | Changes the path names of the parameters inline & models in the components     | https://spec.openapis.org/oas/v3.0.3.html#parameter-object                |
| parametersHeader          | Changes the header names of the parameters inline & models in the components   | https://spec.openapis.org/oas/v3.0.3.html#parameter-object                |
| parametersQuery           | Changes the query names of the parameters inline & models in the components    | https://spec.openapis.org/oas/v3.0.3.html#parameter-object                |
| componentsSchemas         | Changes the names of the schema models in the components sections              | https://spec.openapis.org/oas/v3.0.3.html#components-object               |
| componentsExamples        | Changes the names of the example models in the components sections             | https://spec.openapis.org/oas/v3.0.3.html#components-object               |
| componentsHeaders         | Changes the names of the header models in the components sections              | https://spec.openapis.org/oas/v3.0.3.html#components-object               |
| componentsResponses       | Changes the names of the response models in the components sections            | https://spec.openapis.org/oas/v3.0.3.html#components-object               |
| componentsRequestBodies   | Changes the names of the request body models in the components sections        | https://spec.openapis.org/oas/v3.0.3.html#components-object               |
| componentsSecuritySchemes | Changes the names of the security schemes in the components sections           | https://spec.openapis.org/oas/v3.0.3.html#components-object               |

Available casing options:
- camelCase
- PascalCase
- kebab-case
- snake_case
- CONSTANT_CASE
- capitalCase
- lowerCase
- upperCase

## OpenAPI filter options

By specifying the desired filter values for the available filter types, the openapi-format CLI will strip out any
matching item from the OpenAPI document. You can combine multiple types to filter out a range of OpenAPI items.

For more complex use-cases, we can advise the excellent https://github.com/Mermade/openapi-filter package, which has
extended options for filtering OpenAPI documents.

| Type                | Description                                | Type  | Examples                                  |
|---------------------|--------------------------------------------|-------|-------------------------------------------|
| methods             | OpenAPI methods.                           | array | ['get','post','put']                      |
| inverseMethods      | OpenAPI methods that will be kept.         | array | ['get','post','put']                      |
| tags                | OpenAPI tags.                              | array | ['pet','user']                            |
| inverseTags         | OpenAPI tags that will be kept.            | array | ['pet','user']                            |
| operationIds        | OpenAPI operation ID's.                    | array | ['findPetsByStatus','updatePet']          |
| inverseOperationIds | OpenAPI operation ID's that will be kept.  | array | ['findPetsByStatus','updatePet']          |
| operations          | OpenAPI operations.                        | array | ['GET::/pets','PUT::/pets']               |
| flags               | Custom flags                               | array | ['x-exclude','x-internal']                |
| flagValues          | Custom flags with a specific value         | array | ['x-version: 1.0','x-version: 3.0']       |
| unusedComponents    | Unused components                          | array | ['examples','schemas']                    |
| stripFlags          | Custom flags that will be stripped         | array | ['x-exclude','x-internal']                |
| textReplace         | Search & replace values to replace         | array | [{'searchFor':'Pet','replaceWith':'Dog'}] |

Some more details on the available filter types:

=> **methods**: Refers to the "Path Item Object" http://spec.openapis.org/oas/v3.0.3.html#operationObject

This will remove all fields and attached fields that match the verbs. In the example below, this would mean that
all `get`, `put`, `post` items would be removed from the OpenAPI document.

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

=> **tags**: Refers to the "tags" field from the "Operation
  Object" https://spec.openapis.org/oas/v3.0.3.html#operationObject

This will remove all fields and attached fields that match the tags. In the example below, this would mean that all
items with the tags `pet` or `user` would be removed from the OpenAPI document.

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

=> **operationIds**: Refers to the "operationId" field from the "Operation
  Object" https://spec.openapis.org/oas/v3.0.3.html#operationObject

This will remove specific fields and attached fields that match the operation ID's. In the example below, this would
mean that the item with operationID `findPetsByStatus` would be removed from the OpenAPI document.

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

=> **operations**: Refers to a combination of a OpenAPI method & path from the "Path
  Object" https://spec.openapis.org/oas/v3.0.3.html#paths-object & "Path
  item" https://spec.openapis.org/oas/v3.0.3.html#path-item-object

This will remove specific path items that match the operation definition `PUT::/pets`. In the example below, this would
mean that the item with the path '/pets' and method 'PUT' would be removed from the OpenAPI document.

For example:

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

An `operationId` is an optional property. To offer support for OpenAPI documents that don't have operationIds, we have
added the `operation` definition which is the unique combination of the OpenAPI method & path, with a `::` separator
symbol.

This will allow filtering for very specific OpenAPI items, without the need of adding operationIds to the OpenAPI
document.

To facilitate managing the filtering, we have included wildcard options for the `operations` option, supporting the
methods & path definitions.

REMARK: Be sure to put quotes around the target definition.

Strict matching example: `"GET::/pets"`
This will target only the "GET" method and the specific path "/pets"

Method wildcard matching example: `"*::/pets"`
This will target all methods ('get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace') and the specific
path "/pets"

Path wildcard matching example: `"GET::/pets/*"`
This will target only the "GET" method and any path matching any folder behind the "/pets", like "/pets/123" and
"/pets/123/buy".

Method & Path wildcard matching example: `"*::/pets/*"`
A combination of wildcards for the method and path parts is even possible. 

=> **flags**: Refers to a custom property that can be set on any field in the OpenAPI document.

This will remove all fields and attached fields that match the flags. In the example below, this would mean that all
items with the flag `x-exclude` would be removed from the OpenAPI document.

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

=> **flagValues**: Refers to a flag, custom property which can be set on any field in the OpenAPI document, and the combination with the value for that flag.

This will remove all fields and attached fields that match the flag with the specific value. 

A `flagValues` example:

```yaml
flagValues:
    - x-version: 1.0
    - x-version: 3.0
```
In the example below, this would mean that all items with the flag `x-version` that matches `x-version: 1.0` OR `x-version: 3.0` would be removed from the OpenAPI document.

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
            x-version: 1.0
```

The filter option `flagValues` also will remove flags that contain an array of values in the OpenAPI document.

A `flagValues` example:

```yaml
flagValues:
    - x-versions: 1.0
    - x-versions: 2.0
```

In the example below, this would mean that all items with the flag `x-versions`, which is an array, that match `x-version: 1.0` OR `x-version: 3.0` would be removed from the OpenAPI document.

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
            x-versions:
                - 1.0
                - 3.0
                - 5.0
```

Have a look at [flagValues](test/yaml-filter-custom-flagsvalue-valye) and [flagValues for array values](test/yaml-filter-custom-flagsvalue-array) for a practical example.

=> **unusedComponents**: Refers to a list of [reusable component types]( https://spec.openapis.org/oas/v3.0.3.html#components-object), from which unused items will be removed.

This option allows you to strip the OpenAPI document from any unused items of the targeted `components` types. 
Any item in the list of OpenAPI `components` that is not referenced as `$ref`, will get marked and removed from the OpenAPI document. 

REMARK: We will recursively strip all unused components, with a maximum depth of 10 times. This means that "nested" components, that become unused, will also get removed

Supported component types that can be marked as "unused":
- schemas
- parameters
- examples
- headers
- requestBodies
- responses

=> **textReplace**: "search & replace" option to replace text in the OpenAPI specification

The `textReplace` provides a "search & replace" method, that will search for a text/word/characters in the OpenAPI description, summary, URL fields and replace it with another text/word/characters.
This is very useful to replace data in the OpenAPI specification.

A `textReplace` example:

```yaml
textReplace:
    - searchFor: 'Pets'
      replaceWith: 'Dogs'
    - searchFor: 'swagger.io'
      replaceWith: 'openapis.org'
```

This will replace all "Pets" with "Dogs" & "swagger.io" with "openapi.org" in the OpenAPI document.

=> **stripFlags**: Refers to a list of custom properties that can be set on any field in the OpenAPI document.

The `stripFlags` will remove only the flags, the linked parent and properties will remain. In the example below, this would mean that all
flags `x-exclude` itself would be stripped from the OpenAPI document.

Example before:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
          x-exclude: true
          summary: Finds Pets by status
```

Example after:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        get:
          summary: Finds Pets by status
```

## CLI sort usage

- Format a spec with the default sorting and saves it as a new JSON file

```shell
$ openapi-format openapi.json -o openapi-formatted.json
```

- Format an OpenAPI JSON document with the default sorting and saves it as a new YAML file

```shell
$ openapi-format openapi.json -o openapi.yaml
```

- Format an OpenAPI document with the default sorting and output it as JSON to STDOUT

```shell
$ openapi-format openapi.json --json
```

- Format an OpenAPI document with the default sorting and output it as YAML to STDOUT

```shell
$ openapi-format openapi.json --yaml
```

- Format an OpenAPI JSON document with the default sorting and save it as YAML

```shell
$ openapi-format openapi.json -o openapi.yaml
```

- Format an OpenAPI document but skip the sorting and save it as a new JSON file

```shell
$ openapi-format openapi.json -o openapi-formatted.json --no-sort
```

This should keep the OpenAPI fields in the same order. This can be needed, when you only want to do a filtering or
rename action.

- Format an OpenAPI document, including sorting all elements in the components section

```shell
$ openapi-format openapi.json -o openapi-formatted.json --sortComponentsFile ./test/json-sort-components/customSortComponents.json
```

This will sort all elements in the components ( components/schemas, components/parameters, components/headers,
components/requestBodies, components/responses, ...) section by alphabet.


## CLI filter usage

- Format an OpenAPI document by filtering fields, default sorting and saves it as a new file

When you want to strip certain methods ,tags, operationIds, operations, flags you can pass a `filterFile` which contains the
specific values for the methods ,tags, operationIds, operations, flags.

This can be useful to combine with the sorting, to end up with an order and filtered OpenAPI document.

example:

```shell
$ openapi-format openapi.json -o openapi-formatted.json --filterFile customFilter.yaml
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

## CLI rename usage

- Format an OpenAPI document by changing the title and saves it as a new JSON file

During CI/CD pipelines, you might want to create different results of the OpenAPI document. Having the option to rename
them might make it easier to work with the results, so that is why we provide this command option.

```shell
$ openapi-format openapi.json -o openapi.json --rename "OpenAPI Petstore - OpenAPI 3.0"
```

which results in

- before

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "Petstore - OpenAPI 3.0",
```

- after

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "OpenAPI Petstore - OpenAPI 3.0",
```

## CLI configuration usage

All the CLI options can be managed in a separate configuration file and passed along the openapi-format command. This will
make configuration easier, especially in CI/CD implementations where the configuration can be stored in version control
systems.

example:

```shell
$ openapi-format openapi.json --configFile openapi-format-options.json
```

The formatting will happen based on all the options set in the `openapi-format-options.json` file. All the
available [OpenAPI format options](https://github.com/thim81/openapi-format#openapi-format-options) can be used in the
config file.

## AsyncAPI documents

For handling AsyncAPI documents, we have created a separate
package [asyncapi-format](https://github.com/thim81/asyncapi-format) to allow customisation specific for AsyncAPI
use-cases.

## Stoplight Studio

We have adopted the YAML parsing style from [Stoplight Studio](https://stoplight.io/studio/), by leveraging
the [@stoplight/yaml](https://www.npmjs.com/package/@stoplight/yaml) package for handling the parsing of OpenAPI YAML
files.

By using the Stoplight YAML parsing, the results will be slightly different from when using a normal YAML parsing
library, like [js-to-yaml](https://www.npmjs.com/package/js-yaml). We appreciate the Stoplight Studio tool, since it is
an excellent GUI for working with OpenAPI documents for non-OpenAPI experts who will be contributing changes. By
adopting the Stoplight Studio YAML parsing, the potential risk of merge conflicts will be lower, which is the main
reason why we opted for using the @stoplight/yaml package.

## Credits

This package is inspired by
the [@microsoft.azure/format-spec](https://www.npmjs.com/package/@microsoft.azure/format-spec) from @fearthecowboy. The
original code was not available on GitHub, with the last update was 3 years ago, so to improve support and extend it we
tried to reproduce the original functionality.

The filter capabilities from `openapi-format` are a light version inspired by the work from @MikeRalphson on
the https://github.com/Mermade/openapi-filter package.
