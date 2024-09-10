![openapi-format icon](./assets/openapi-format-logo.svg)

<a href="https://www.npmjs.com/package/openapi-format" alt="Latest Stable Version">![npm](https://img.shields.io/npm/v/openapi-format.svg)</a>
<a href="https://www.npmjs.com/package/openapi-format" alt="Total Downloads">![npm](https://img.shields.io/npm/dw/openapi-format.svg)</a>

# openapi-format

Format an OpenAPI document by ordering, formatting and filtering fields.

The openapi-format CLI can load an OpenAPI file, sorts the OpenAPI fields by ordering them in a hierarchical order, format the casing of the fields and
can output the file with clean indenting, to either JSON or YAML.

Next to the ordering & formatting, the CLI provides additional options to filter fields & parts of the OpenAPI document based on
flags, tags, methods, operationID's and even unused components.

The openapi-format CLI has the option to convert an OpenAPI 3.0 document to an OpenAPI version 3.1.

## Table of content
* [Use-cases](#use-cases)
* [Features](#features)
* [Online playground](#online-playground)
* [Installation](#installation)
    + [Local Installation (recommended)](#local-installation-recommended)
    + [Global Installation](#global-installation)
    + [NPX usage](#npx-usage)
* [Command Line Interface](#command-line-interface)
* [OpenAPI format CLI options](#openapi-format-cli-options)
* [OpenAPI sort configuration options](#openapi-sort-configuration-options)
* [OpenAPI formatting configuration options](#openapi-formatting-configuration-options)
* [OpenAPI filter options](#openapi-filter-options)
* [OpenAPI generate elements](#openapi-generate-options)
* [CLI sort usage](#cli-sort-usage)
* [CLI filter usage](#cli-filter-usage)
* [CLI generate usage](#cli-generate-usage)
* [CLI casing usage](#cli-casing-usage)
* [CLI rename usage](#cli-rename-usage)
* [CLI convertTo usage](#cli-convertto-usage)
* [CLI configuration usage](#cli-configuration-usage)
* [Credits](#credits)

## Use-cases

**Public documentation:**
An OpenAPI document is a specification that evolves and changes. To facilitate working with the specification and publishing the
document as public documentation, you want to deliver a clean and structured specification. OpenAPI-format helps you to
organize the fields by sorting, formatting and filtering specific elements from the OpenAPI like internal endpoints, beta tags, ...
and even unused schemas, examples, responses, ... with a clean and optimized OpenAPI document as a result.

**Maintenance:**
When working on large OpenAPI documents or with multiple team members, the file can be become messy and difficult to
compare changes. By sorting & formatting from time to time, the fields are all ordered in a structured manner & properly cased, which will help you
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
- [x] Filter OpenAPI files based on response content-types
- [x] Strip flags from OpenAPI files
- [x] Strip unused components from OpenAPI files
- [x] Generate OpenAPI elements for consistency
- [x] Convert OpenAPI 3.0 documents to OpenAPI 3.1 
- [x] Rename the OpenAPI title
- [x] Support OpenAPI documents in JSON format
- [x] Support OpenAPI documents in YAML format
- [x] Format via CLI
- [x] Format via local or remote config files
- [x] Use as a Module
- [x] Aligned YAML parsing style with Stoplight Studio style
- [x] Support for OpenAPI 3.0
- [x] Support for OpenAPI 3.1 (beta)
- [x] Online playground (https://openapi-format-playground.vercel.app/)

## Online playground

The [OpenAPI-Format Playground](https://openapi-format-playground.vercel.app/) is a web-based tool for formatting and sorting OpenAPI documents, powered by the openapi-format CLI.

<a href="https://openapi-format-playground.vercel.app/" target="_blank" title="OpenAPI-format Playground" rel="nofollow">
<img src="https://raw.githubusercontent.com/thim81/openapi-format/main/assets/openapi-format-playground.png" alt="OpenAPI-format Playground" width="50%"><br>
<img src="https://raw.githubusercontent.com/thim81/openapi-format/main/assets/openapi-format-playground-diff.png" alt="OpenAPI-format Playground Diff viewer" width="25%">
<img src="https://raw.githubusercontent.com/thim81/openapi-format/main/assets/openapi-format-playground-filter.png" alt="OpenAPI-format Playground Filter UI" width="25%">
</a>

More info about the features and usage, can be found in the [readme](https://github.com/thim81/openapi-format-playground?tab=readme-ov-file#features).

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
openapi-format.js <input-file> -o [output-file] [options]

Arguments:
  input-file   the OpenAPI document can be a local or remote file in JSON or YAML format
  output-file  the output file is optional and can be either a .json or .yaml file. 

Options:

  --output, -o          Save the formated OpenAPI file as JSON/YAML             [path]

  --sortFile            The file to specify custom OpenAPI fields ordering      [path]
  --casingFile          The file to specify casing rules                        [path]
  --generateFile        The file to specify generate rules                      [path]
  --filterFile          The file to specify filter rules                        [path]

  --no-sort             Don't sort the OpenAPI file                          [boolean]
  --keepComments        Don't remove the comments from the OpenAPI YAML file [boolean]
  --sortComponentsFile  The file with components to sort alphabetically         [path]

  --rename              Rename the OpenAPI title                              [string]
  
  --convertTo           convert the OpenAPI document to OpenAPI version 3.1   [string]

  --configFile          The file with the OpenAPI-format CLI options            [path]

  --lineWidth           Max line width of YAML output                         [number]

  --json                Prints the file to stdout as JSON                    [boolean]
  --yaml                Prints the file to stdout as YAML                    [boolean]

  --playground, -p      Open config in online playground
  --help                Show help                                            [boolean]
  --version             Output the version number                            
  --verbose             Output more details of the filter process              [count]
```

## OpenAPI format CLI options

| Parameter            | Alias         | Description                                                                 | Input type   | Default                    | Info     |
|----------------------|---------------|-----------------------------------------------------------------------------|--------------|----------------------------|----------|
| file                 |               | the OpenAPI document can be a local or remote file in JSON or YAML format   | path to file |                            | required |
| --output             | -o            | save the formatted OpenAPI file as JSON/YAML                                | path to file |                            | optional |
| --sortFile           | -s            | the file to specify custom OpenAPI fields ordering                          | path to file | defaultSort.json           | optional |
| --filterFile         | -f            | the file to specify filter setting                                          | path to file | defaultFilter.json         | optional |
| --casingFile         | -k            | the file to specify casing setting                                          | path to file |                            | optional |
| --generateFile       | -g            | the file to specify generate rules                                          | path to file |                            | optional |
| --no-sort            |               | don't sort the OpenAPI file                                                 | boolean      | FALSE                      | optional |
| --keepComments       |               | don't remove the comments from the OpenAPI YAML file                        | boolean      | FALSE                      | optional |
| --sortComponentsFile |               | sort the items of the components (schemas, parameters, ...) by alphabet     | path to file | defaultSortComponents.json | optional |
| --rename             |               | rename the OpenAPI title                                                    | string       |                            | optional |
| --convertTo          |               | convert the OpenAPI document to OpenAPI version 3.1                         | string       |                            | optional |
| --configFile         | -c            | the file with all the format config options                                 | path to file |                            | optional |
| --lineWidth          |               | max line width of YAML output                                               | number       | -1 (Infinity)              | optional |
| --json               |               | prints the file to stdout as JSON                                           |              | FALSE                      | optional |
| --yaml               |               | prints the file to stdout as YAML                                           |              | FALSE                      | optional |
| --playground         | -p            | open config in online playground                                            |              |                            | optional |
| --version            |               | output the version number                                                   |              |                            | optional |
| --verbose            | -v, -vv, -vvv | verbosity that can be increased, which will show more output of the process |              |                            | optional |
| --help               | h             | display help for command                                                    |              |                            | optional |

## OpenAPI sort configuration options

The CLI will sort the OpenAPI document in the defined order liked defined per OpenAPI key/field/property/element. The fields that are
not specified will keep their order like it is in the original OpenAPI document, so only defined fields will be
re-ordered.

The default sorting of the different fields based on the defined order (listed in the table below), which is stored in
the [defaultSort.json](https://github.com/thim81/openapi-format/blob/main/defaultSort.json) file.

### OpenAPI sort fields

You can easily modify this by specifying your own ordering per key, which can be passed on to the CLI (see below for an
example on how to do this).

| Key         | Ordered by                                                                                                      | OpenAPI reference                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------| ------------------------------------------------------------------------- |
| root        | - openapi<br>\- info<br>\- servers<br>\- paths<br>\- components<br>\- tags<br>\- x-tagGroups<br>\- externalDocs | [openapi-object](https://spec.openapis.org/oas/v3.0.3.html#openapi-object)                  |
| get         | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | [operationObject](https://spec.openapis.org/oas/v3.0.3.html#operationObject)                |
| post        | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | [operationObject](https://spec.openapis.org/oas/v3.0.3.html#operationObject)                 |
| put         | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | [operationObject](https://spec.openapis.org/oas/v3.0.3.html#operationObject)                 |
| patch       | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | [operationObject](https://spec.openapis.org/oas/v3.0.3.html#operationObject)                 |
| delete      | - operationId<br>\- summary<br>\- description<br>\- parameters<br>\- requestBody<br>\- responses                | [operationObject](https://spec.openapis.org/oas/v3.0.3.html#operationObject)                 |
| parameters  | - name<br>\- in<br>\- description<br>\- required<br>\- schema                                                   | [parameterObject](https://spec.openapis.org/oas/v3.0.3.html#parameterObject)                 |
| requestBody | - description<br>\- headers<br>\- content<br>\- links                                                           | [request-body-object](https://spec.openapis.org/oas/v3.0.3.html#request-body-object)             |
| responses   | - description<br>\- headers<br>\- content<br>\- links                                                           | [responses-object](https://spec.openapis.org/oas/v3.0.3.html#responses-object)                |
| content     | (By alphabet)                                                                                                   | [responses-object](https://spec.openapis.org/oas/v3.0.3.html#responses-object)                |
| components  | - parameters<br>\- schemas                                                                                      | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object)               |
| schema      | - description<br>\- type<br>\- items<br>\- properties<br>\- format<br>\- example<br>\- default                  | [schemaObject](https://spec.openapis.org/oas/v3.0.3.html#schemaObject)                    |
| schemas     | - description<br>\- type<br>\- items<br>\- properties<br>\- format<br>\- example<br>\- default                  |                                                                           |
| properties  | - description<br>\- type<br>\- items<br>\- format<br>\- example<br>\- default<br>\- enum                        |                                                                           |

Have a look at the folder [yaml-default](test/yaml-default) and compare the "output.yaml" (sorted document) with the "input.yaml" (original document), to see how openapi-format have sorted the OpenAPI document.

### OpenAPI sort Paths

You can change the order of the paths defined in the OpenAPI specification and sort them alphabetically (`path`) or by the first tag of the first method (`tags`).

Options to sort by:

- `original` (default): keep the order as defined in the OpenAPI specification
- `path`: order the paths alphabetically by the path parts
- `tags`: order by the first tag of the first method

| Key         | Options                      | OpenAPI reference                                                      |
|-------------|------------------------------|------------------------------------------------------------------------|
| sortPathsBy | 'original' / 'path' / 'tags' | [paths-object](https://spec.openapis.org/oas/v3.0.3.html#paths-object) |



## OpenAPI filter options

By specifying the desired filter values for the available filter types, the openapi-format CLI will strip out any
matching item from the OpenAPI document. You can combine multiple types to filter out a range of OpenAPI items.

For more complex use-cases, we can advise the excellent https://github.com/Mermade/openapi-filter package, which has
extended options for filtering OpenAPI documents.

| Type                   | Description                                 | Type    | Examples                                  |
|------------------------|---------------------------------------------|---------|-------------------------------------------|
| methods                | OpenAPI methods.                            | array   | ['get','post','put']                      |
| inverseMethods         | OpenAPI methods that will be kept           | array   | ['get','post','put']                      |
| tags                   | OpenAPI tags                                | array   | ['pet','user']                            |
| inverseTags            | OpenAPI tags that will be kept              | array   | ['pet','user']                            |
| operationIds           | OpenAPI operation ID's                      | array   | ['findPetsByStatus','updatePet']          |
| inverseOperationIds    | OpenAPI operation ID's that will be kept    | array   | ['findPetsByStatus','updatePet']          |
| operations             | OpenAPI operations                          | array   | ['GET::/pets','PUT::/pets']               |
| flags                  | Custom flags                                | array   | ['x-exclude','x-internal']                |
| inverseFlags           | Custom flags that will kept                 | array   | ['x-exclude','x-internal']                |
| flagValues             | Custom flags with a specific value          | array   | ['x-version: 1.0','x-version: 3.0']       |
| inverseFlagValues      | Custom flags with a value that will be kept | array   | ['x-version: 1.0','x-version: 3.0']       |
| responseContent        | Response Content types                      | array   | ['application/json','application/html']   |
| inverseResponseContent | Response Content types that will kept       | array   | ['application/ld+json']                   |
| requestContent         | Request Body Content types                  | array   | ['application/json','application/html']   |
| inverseRequestContent  | Request Body Content types that will kept   | array   | ['application/ld+json']                   |
| unusedComponents       | Unused components                           | array   | ['examples','schemas']                    |
| stripFlags             | Custom flags that will be stripped          | array   | ['x-exclude','x-internal']                |
| preserveEmptyObjects   | Preserve empty object                       | boolean | true OR ['schema']                        |
| textReplace            | Search & replace values to replace          | array   | [{'searchFor':'Pet','replaceWith':'Dog'}] |

Some more details on the available filter types:

### Filter - methods/inverseMethods

=> **methods**: Refers to the [Path Item Object](http://spec.openapis.org/oas/v3.0.3.html#operationObject)

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

=> **inverseMethods**: This option does the inverse filtering, by keeping only the verbs defined and remove all other verbs.

### Filter - tags

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

=> **inverseTags**: This option does the inverse filtering, by keeping only the tags defined and remove all other tags, including the operations without a tags.

### Filter - operationIds

=> **operationIds**: Refers to the "operationId" field from the [Operation Object](https://spec.openapis.org/oas/v3.0.3.html#operationObject)

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

=> **inverseTags**: This option does the inverse filtering, by keeping only the operationIds defined and remove all other operationIds, including the operations without an operationId.

### Filter - operations

=> **operations**: Refers to a combination of a OpenAPI method & path from the [Path Object](https://spec.openapis.org/oas/v3.0.3.html#paths-object)
& [Path item](https://spec.openapis.org/oas/v3.0.3.html#path-item-object)

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

### Filter - flags/inverseFlags

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

=> **inverseFlags**: This option does the inverse filtering, by keeping only the operations, components, tags, x-tagGroups that match the flag(s). This is a very aggressive option to keep only the items that are needed.

### Filter - flagValues/inverseFlagValues

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

Have a look at [flagValues](test/yaml-filter-custom-flagsvalue-value) and [flagValues for array values](test/yaml-filter-custom-flagsvalue-array) for a practical example.

=> **inverseFlagValues**: This option does the inverse filtering, by keeping only the operations, components, tags, x-tagGroups that match the flag with the specific value. This is a very aggressive option to keep only the items that are needed.

### Filter - responseContent/inverseResponseContent

=> **ResponseContent**: Refers to the [Response Object's content](https://spec.openapis.org/oas/v3.0.3.html#response-object)

A responses `content` filter example:

```yaml
responseContent:
  - application/json
```

This will remove all the content that match the media types from the responses. In the example below, this would mean that all `application/json`
content items would be removed from the OpenAPI document

Example before:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
  /pet:
    post:
      tags:
        - pet
      summary: Add a new pet to the store
      description: Add a new pet to the store
      operationId: addPet
      x-visibility: true
      responses:
        '200':
          description: Successful operation
          content:
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'
        '405':
          description: Invalid input
```

Example after:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
  /pet:
    post:
      tags:
        - pet
      summary: Add a new pet to the store
      description: Add a new pet to the store
      operationId: addPet
      x-visibility: true
      responses:
        '200':
          description: Successful operation
          content:
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
        '405':
          description: Invalid input
```

=> **inverseResponseContent**: This option does the inverse filtering, by keeping only the content with media types defined and remove all other content.

### Filter - requestContent/inverseRequestContent

=> **requestContent**: Refers to the [Request Body Object's content](https://spec.openapis.org/oas/v3.0.3.html#request-body-object)

A  request body `content` filter example:

```yaml
requestContent:
  - application/json
```

This will remove all the content that match the media types from the request body. In the example below, this would mean that all `application/json`
content items would be removed from the OpenAPI document.

Example before:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
  /pet:
    post:
      tags:
        - pet
      summary: Add a new pet to the store
      description: Add a new pet to the store
      operationId: addPet
      x-visibility: true
      requestBody: 
          content:
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
            application/json:
              schema:
                $ref: '#/components/schemas/Pet'

```

Example after:

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
  /pet:
    post:
      tags:
        - pet
      summary: Add a new pet to the store
      description: Add a new pet to the store
      operationId: addPet
      x-visibility: true
      requestBody:
          content:
            application/xml:
              schema:
                $ref: '#/components/schemas/Pet'
```

=> **inverseRequestContent**: This option does the inverse filtering, by keeping only the content with media types defined and remove all other content types from the request body.

### Filter - unusedComponents

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

### Filter - textReplace

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

### Filter - stripFlags

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

### Filter - preserveEmptyObjects

=> **preserveEmptyObjects**: Refers to any properties of your OpenAPI document, from which empty object values would be kept.

The `preserveEmptyObjects` will preserve all empty objects if set to `true`.

You can also pass a list of keys from which preserve empty objects. For instance a `['schema']` value would only prevent removal of empty objects having for key `schema`.

REMARK: Please note that openapi-format default behavior is to remove all empty objects from your document, except for items of examples, security, schemas, default, oneOf, allOf.

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        post:
          requestBody:
            description: Create a new pet in the store
            required: true
            content:
              application/json:
                schema: {}
```

Example after (with `preserveEmptyObjects: false`):

```yaml
openapi: 3.0.0
info:
    title: API
    version: 1.0.0
paths:
    /pets:
        post:
          requestBody:
            description: Create a new pet in the store
            required: true
            content:
              application/json: {}
```

## OpenAPI formatting configuration options

Tools like [spectral](https://github.com/stoplightio/spectral) or [speccy](https://speccy.io/), or any of the [linting tools](https://nordicapis.com/8-openapi-linters/), provide a manner to validate & lint OpenAPI specifications to be uniform. The linting tool informs about the incorrect usage of OpenAPI properties & inconsistent field names.
This is very useful and helps to guard the quality of the OpenAPI specification. They inform which fields to correct so that the specification will comply with all the defined linting rules.

The openapi-format CLI formatting option can assist with keeping the field names consistent by automatically changing the casing of the properties/keys/names for the different elements in the OpenAPI document.
The desired casing can be defined per OpenAPI key/element (see list below).
The keys that are not specified will keep their casing like it is in the original OpenAPI document, so only for defined fields, the casing will be changed.

| Key                        | Description                                                                                          | OpenAPI reference                                                         |
|----------------------------|------------------------------------------------------------------------------------------------------| ------------------------------------------------------------------------- |
| operationId                | Changes operation ID's that are part of the Operations Object                                        | [operation-object](https://spec.openapis.org/oas/v3.0.3.html#operation-object)|
| properties                 | Changes property keys of the schemas of the inline response/requestBody & components                 | [schemaObject](https://spec.openapis.org/oas/v3.0.3.html#schemaObject) |
| parametersCookie           | Changes the cookie name of the parameters inline & models in the components                          | [parameter-object](https://spec.openapis.org/oas/v3.0.3.html#parameter-object) |
| parametersPath             | Changes the path name of the parameters inline & models in the components                            | [parameter-object](https://spec.openapis.org/oas/v3.0.3.html#parameter-object) |
| parametersHeader           | Changes the header name of the parameters inline & models in the components                          | [parameter-object](https://spec.openapis.org/oas/v3.0.3.html#parameter-object) |
| parametersQuery            | Changes the query name of the parameters inline & models in the components                           | [parameter-object](https://spec.openapis.org/oas/v3.0.3.html#parameter-object) |
| componentsParametersCookie | Changes the key of the cookie models in the components parameters sections & "$ref" links            | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsParametersPath   | Changes the key of the path models in the components parameters sections & "$ref" links              | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsParametersQuery  | Changes the key of the query models in the components parameters sections & "$ref" links             | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsParametersHeader | Changes the key of the header models in the components parameters sections & "$ref" links            | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsSchemas          | Changes the key of the schema models in the components sections & "$ref" links                       | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsExamples         | Changes the key of the example models in the components sections & "$ref" links                      | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsHeaders          | Changes the key of the header models in the components sections & "$ref" links                       | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsResponses        | Changes the key of the response models in the components sections & "$ref" links                     | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsRequestBodies    | Changes the key of the request body models in the components sections & "$ref" links                 | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |
| componentsSecuritySchemes  | Changes the key of the security schemes in the components sections & "$ref" links                    | [components-object](https://spec.openapis.org/oas/v3.0.3.html#components-object) |

### Casing options

| Casing type      | Casing alias | Description                                       | Example          |
| -----------------| ------------ | ------------------------------------------------- | --------------- |
| 🐪 camelCase     | camelCase    | converts a strings to `camelCase`                 | `openapiFormat`  |
| 👨‍🏫 PascalCase    | PascalCase   | converts a strings to `PascalCase`                | `OpenapiFormat`  |
| 🥙 kebab-case    | kebabCase    | converts a strings to `kebab-case`                | `openapi-format` |
| 🚂 Train-Case    | TrainCase    | converts a strings to `Train-Case`                | `Openapi-Format` |
| 🐍 snake_case    | snakeCase    | converts a strings to `snake_case`                | `openapi_format` |
| 🕊 Ada_Case      | AdaCase      | converts a strings to `Ada_Case`                  | `Openapi_Format` |
| 📣 CONSTANT_CASE | constantCase | converts a strings to `CONSTANT_CASE`             | `OPENAPI_FORMAT` |
| 👔 COBOL-CASE    | cobolCase    | converts a strings to `COBOL-CASE`                | `OPENAPI-FORMAT` |
| 📍 Dot.notation  | dotNotation  | converts a strings to `Dot.notation`              | `openapi.format` |
| 🛰 Space case    | spaceCase    | converts a strings to `Space case` (with spaces)  | `openapi format` |
| 🏛 Capital Case  | capitalCase  | converts a strings to `Capital Case` (with spaces)| `Openapi Format` |
| 🔡 lower case    | lowerCase    | converts a strings to `lower case` (with spaces)  | `openapi format` |
| 🔠 UPPER CASE    | upperCase    | converts a strings to `UPPER CASE` (with spaces)  | `OPENAPI FORMAT` |

> REMARK: All special characters are stripped during conversion, except for the `@` and `$`, since they can be part of the query strings.

The casing options are provided by the nano NPM [case-anything](https://github.com/mesqueeb/case-anything) package.

### Format casing - operationId

=> **operationId**: Refers to the `operationId` properties in the OpenAPI document.

Formatting casing example:

```yaml
operationId: kebab-case
```

Example before:

```yaml
openapi: 3.0.3
paths:
    /pets:
        get:
          operationId: getPets
```

openapi-format will format the "getPets" from the original camelcase to kebab-case.

Example after:

```yaml
openapi: 3.0.3
paths:
    /pets:
        get:
          operationId: get-pets
```

### Format casing - model & schema properties

=> **properties**: Refers to all the schema properties, that are defined inline in the paths request bodies & responses and the models in the components section of the OpenAPI document.

Formatting casing example:

```yaml
properties: snake_case
```

Example before:

```yaml
openapi: 3.0.3
components:
    schemas:
        UserModel:
            type: object
            properties:
                id:
                    type: integer
                    example: 10
                emailAddress:
                    type: string
                    example: john@doe.com
                firstName:
                    type: string
                    example: John
```

The CLI will format all the properties like: "id", "username", "firstName" from the original camelcase to snake_case.

Example after:

```yaml
openapi: 3.0.3
components:
    schemas:
        UserModel:
            type: object
            properties:
                id:
                    type: integer
                    example: 10
                email_address:
                    type: string
                    example: john@doe.com
                first_name:
                    type: string
                    example: John
```

### Format casing - component keys

=> **componentsSchemas / componentsExamples / componentsParametersCookie / componentsParametersHeader / componentsParametersQuery / componentsParametersQuery / componentsParametersPath / componentsHeaders / componentsResponses / componentsRequestBodies / componentsSecuritySchemes**: Refers to all the model objects that are defined in the components section of the OpenAPI document.

Formatting casing example:

```yaml
componentsSchemas: PascalCase
```

Example before:

```yaml
openapi: 3.0.3
paths:
    /orders:
        get:
            responses:
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/order-model'
components:
    schemas:
        userModel:
            type: object
        order-model:
            type: object
        pet_model:
            type: object
```

openapi-format will format all the component keys like: "userModel", "order-model", "pet_model" to PascalCase, including formatting all the "$ref" used in the OpenAPI document.

Example after:

```yaml
openapi: 3.0.3
paths:
    /orders:
        get:
            responses:
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/OrderModel'
components:
    schemas:
        UserModel:
            type: object
        OrderModel:
            type: object
        PetModel:
            type: object
```

### Format casing - parameter names

=> **componentsParametersCookie / componentsParametersPath / componentsParametersQuery / componentsParametersHeader**: Refers to "name" in the Parameters types: Path, Query or Header, which can be defined inline in the Path or as a reference in the components of the OpenAPI document.

Formatting casing example:

```yaml
componentsParametersPath: kebab-case
```

Example before:

```yaml
openapi: 3.0.3
paths:
    '/pet/{petId}':
        get:
            parameters:
                - name: petId
                  in: path
                  description: ID of pet to return
                - $ref: '#/components/parameters/LimitParam'
components:
    parameters:
        LimitParam:
            name: limitParam
            in: query
            description: max records to return
```

The CLI will format the "name" of the parameters: Path, Query or Header like: "petId", "limitParam" to kebab-case in the OpenAPI document.

Example after:

```yaml
openapi: 3.0.3
paths:
    '/pet/{petId}':
        get:
            parameters:
                - name: pet-id
                  in: path
                  description: ID of pet to return
               - $ref: '#/components/parameters/LimitParam'
components:
    parameters:
        LimitParam:
            name: limit-param
            in: query
            description: max records to return
```

### OpenAPI Generate Options

The OpenAPI formatting tool allows you to generate various elements such as `operationId`, and more using customizable templates. These templates enable dynamic generation of missing or incomplete values in your OpenAPI specification, ensuring consistency and adherence to your conventions.

Options for generating elements:

- `operationIdTemplate`: Generate the `operationId` using placeholders like `<method>`, `<pathPart2>`, etc.
- `overwriteExisting`: Set to `true` or `false` to control whether existing values should be overwritten (default: `false`).

| Key                 | Options                        | OpenAPI Reference                                                              |
|---------------------|--------------------------------|--------------------------------------------------------------------------------|
| operationIdTemplate | Customizable with placeholders | [operation-object](https://spec.openapis.org/oas/v3.0.3.html#operation-object) |
| overwriteExisting   | `true` / `false`               | N/A                                                                            |

See [CLI generate usage](#cli-generate-usage) for an example and the available template options.

## CLI sort usage

- Format a spec with the default sorting and saves it as a new JSON file

```shell
$ openapi-format openapi.json -o openapi-formatted.json
```

- Format a remote spec with the default sorting and saves it as a new JSON file

```shell
$ openapi-format https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/api-with-examples.json -o openapi-formatted.json
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

- Convert the OpenAPI 3.0 document to OpenAPI 3.1 but skip the sorting and save it as a new YAML file

```shell
$ openapi-format openapi.yaml -o openapi-3.1.yaml --no-sort --convertTo "3.1"
```

This will convert the OpenAPI 3.0 document into version 3.1 of OpenAPI, without any ordering or filtering.
During the conversion, openapi-format will transform all OpenAPI 3.0 properties into the OpenAPI 3.1 properties, as described in the [migration guide from
Phil Sturgeon](https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0).

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

## CLI generate usage

- Generate OpenAPI elements and saves it as a new file

The OpenAPI formatting tool allows you to generate OpenAPI elements, such as `operationId`, `summary`, and more, based on configurable templates. The generated elements will be saved to the output OpenAPI file.

You can also combine generation with filtering and sorting to customize the output. For example, if you want to strip certain methods, tags, operationIds, operations, or flags, you can pass a `filterFile` containing the specific values to exclude. This helps you refine your OpenAPI document further, ensuring it’s well-ordered and only contains the relevant parts.

example:

```shell
$ openapi-format openapi.json -o openapi-formatted.json --generateFile customGenerate.yaml
```

where the `customGenerate.yaml` would contain a combination of all the elements you to generate.

```yaml
operationIdTemplate: "<method>_<pathPart2>"
overwriteExisting: false
```

**Template Options:**
In the customGenerate.yaml, you can define templates for various OpenAPI properties using dynamic placeholders. These placeholders will be replaced by actual values from the OpenAPI operations. Below is a list of available placeholders and what they represent:

- `<operationId>` : The operationId of the OpenAPI operation. Example: leadsAll
- `<method>` : The HTTP method of the OpenAPI operation. Example: GET
- `<path>` : The path of the OpenAPI operation. Example: /crm/leads
- `<pathRef>` : The path reference of the OpenAPI operation. Example: GET::/crm/leads
- `<tag>` : The first tag name of the OpenAPI operation. Example: Leads
- `<tag1>` : The first tag name of the OpenAPI operation. Example: Leads
- `<tag2>` : The second tag name of the OpenAPI operation, if more than one tag is defined. Example: CRM
- `<tagn>` : The nth tag name of the OpenAPI operation if more than one tag is defined.
- `<pathPart1>` : The first part of the path of the OpenAPI operation. Example: crm
- `<pathPart2>` : The second part of the path of the OpenAPI operation. Example: leads
- `<pathPartn>` : The nth part of the path of the OpenAPI operation.

You can also include static text in the templates, which will be merged with the dynamic placeholders. For example:

```yaml
operationIdTemplate: "Prefix_<method>_<pathPart2>_Handler"
```

**Configuration Options:**

- `operationIdTemplate`: Template for generating `operationId`. Use dynamic placeholders like <method> and <pathPart2>.
- `overwriteExisting`: Set to `true` or `false` to control whether existing values should be overwritten. Default: `false`.

## CLI casing usage

- Generate OpenAPI elements and saves it as a new file

The OpenAPI formatting tool allows you to enforce consistent casing styles across various OpenAPI elements, such as `operationId`, `summary`, `parameters`, and more. The specified casing preferences will be applied to the relevant elements and saved to the output OpenAPI file.

example:

```shell
$ openapi-format openapi.json -o openapi-formatted.json --casingFile customCasing.yaml
```

where the `customCasing.yaml` would contain a casing preferences for the specified of the elements.

In this example, the customCasing.yaml file would contain the desired casing preferences for specific OpenAPI elements.

```yaml
operationId: snake_case
properties: camelCase

parametersQuery: kebab-case
parametersHeader: kebab-case
parametersPath: snake_case

componentsExamples: PascalCase
componentsSchemas: camelCase
componentsHeaders: kebab-case
componentsResponses: snake_case
componentsRequestBodies: snake_case
componentsSecuritySchemes: PascalCase

componentsParametersQuery: snake_case
componentsParametersHeader: kebab-case
componentsParametersPath: camelCase
```

**Casing Options:**
In the customCasing.yaml, you can define the casing style for various OpenAPI properties, allowing you to customize the appearance of your document consistently.

- `operationId`: Defines the casing for operation IDs. Example: snake_case, PascalCase, or camelCase.
- `properties`: Sets the casing for properties within components. Example: camelCase.
- `parametersQuery`, `parametersHeader`, `parametersPath`: Define different casing styles for parameters based on their location (query, header, path). Example: snake_case, kebab-case.
- and many more

See [OpenAPI formatting configuration options](#openapi-formatting-configuration-options) for the full list of casing options

## CLI rename usage

- Format an OpenAPI document by changing the title and saves it as a new JSON file

During CI/CD pipelines, you might want to create different results of the OpenAPI document. Having the option to rename
them might make it easier to work with the results, so that is why we provide this command option.

```shell
$ openapi-format openapi.json -o openapi.json --rename "OpenAPI Petstore - OpenAPI 3.0"
```

which results in

**before**

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "Petstore - OpenAPI 3.0",
```

**after**

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "OpenAPI Petstore - OpenAPI 3.0",
```

## CLI convertTo usage

> 🏗 BETA NOTICE: This feature is considered BETA since we are investigating the configuration syntax and extra formatting/casing capabilities.

- Format & convert the OpenAPI document to OpenAPI version 3.1

openapi-format can help you to upgrade your current OpenAPI 3.0.x document to the latest version OpenAPI 3.1.

```shell
$ openapi-format openapi.json -o openapi-3.1.json --convertTo "3.1"
```

which results in all the changes described in the [migration guide from Phil Sturgeon](https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0)

**before**

```json
{
    "openapi": "3.0.2",
    "info": {
        "title": "Petstore - OpenAPI",
```

**after**

```json
{
    "openapi": "3.1.0",
    "info": {
        "title": "OpenAPI Petstore - OpenAPI",
```

## CLI configuration usage

The openapi-format CLI supports bundling all options in a single configuration file. This can simplify management, especially for CI/CD pipelines where configurations are stored in version control systems.

### Using the --configFile option

You can pass a configuration file containing all the options that would otherwise be passed via the CLI. This helps in centralizing the configuration for your OpenAPI formatting operations.

Example:

```shell
$ openapi-format openapi.json --configFile openapi-format-options.json
```
The formatting will happen based on all the options set in the `openapi-format-options.json` file. All the
available [OpenAPI format options](https://github.com/thim81/openapi-format#openapi-format-options) can be used in the config file.

The openapi-format-options.json file might look like this:

```json
{
  "sort": true,
  "casingSet": {
    "operationId": "camelCase",
    "properties": "snake_case"
  },
  "filterSet": {
    "tags": ["internal", "beta"]
  },
  "generateSet": {
    "operationIdTemplate": "<method>_<pathPart2>_Handler"
  }
}
```

Alternatively, you can reference external files for each setting using the corresponding File properties.

```json
{
    "sortFile": "customSort.json",
    "casingFile": "casing-rules.json",
    "filterFile": "filter-rules.json",
    "generateFile": "generate-rules.json"
}
```

In this case, the settings will be loaded from the external files, and they override any inline configurations.

**Define sort, filter, casing, generate options**

You can either pass the settings inline or reference an external file using the appropriate File property:

- **sortSet** / **sortFile**: Sort the fields in the OpenAPI document based on the order defined in the sort settings.

  - Inline: Pass the sort order directly using sortSet in the config file.
  - File: Use sortFile to specify the path to a local or remote JSON/YAML file containing custom sorting rules.

- **casingSet** / **casingFile**: Define the casing convention for operationId, parameters, properties, etc.

  - Inline:
    ```json
    "casingSet": {
      "operationId": "camelCase",
      "properties": "PascalCase"
    }
    ```

  - File: Use casingFile to specify the path to a local or remote JSON/YAML file containing casing rules.

- **filterSet** / **filterFile**: Filter out specific tags, paths, or components from the OpenAPI document.

  - Inline:
    ```json
    "filterSet": {
      "tags": ["internal", "beta"]
    }
    ```

  - File: Use filterFile to specify the path to a local or remote JSON/YAML file containing filter rules.

- **generateSet** / **generateFile**: Automatically generate operationId, summary, and other elements based on predefined templates.

  - Inline:
    ```json
    "generateSet": {
      "operationIdTemplate": "<method>_<pathPart2>_Handler"
    }
    ```

  - File: Use generateFile to specify the path to a local or remote JSON/YAML file containing generate rules.


### Using .openapiformatrc

In addition to specifying a configuration file using `--configFile`, openapi-format also supports automatically loading a configuration file named `.openapiformatrc from the current directory. If this file is present, it will be used as the configuration source, and individual options passed via the CLI will override the settings from this file.

Example of a .openapiformatrc file:

```json
{
  "output": "openapi-final.yaml",  
  "sort": true,
  "filterSet": {
      "tags": ["internal", "beta"]
  }
}
```

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
adopting the Stoplight Studio YAML parsing, the potential risk of merge conflicts will be lowered, which is the main
reason why we opted for using the @stoplight/yaml package.

## Credits

This package is inspired by
the [@microsoft.azure/format-spec](https://www.npmjs.com/package/@microsoft.azure/format-spec) from [@fearthecowboy](https://github.com/fearthecowboy). The
original code was not available on GitHub, with the last update being 3 years ago, so to improve support and extend it we
tried to reproduce the original functionality.

The filter capabilities from `openapi-format` are a light version grounded by the work from [@MikeRalphson](https://github.com/mikeralphson) on
the [openapi-filter](https://github.com/Mermade/openapi-filter) package.

The casing options available in `openapi-format` are powered by the excellent [case-anything](https://github.com/mesqueeb/case-anything) nano package from Luca Ban ([@mesqueeb](https://github.com/mesqueeb)).

<div style="width: 200px;">
<a href="https://www.jetbrains.com/" target="_blank"><svg fill="none" viewBox="0 0 298 64" class="_siteLogo__image_r5k10n_1"><defs><linearGradient id="__WEBTEAM_UI_SITE_HEADER_LOGO_ID__0" x1="0.85" x2="62.62" y1="62.72" y2="1.81" gradientUnits="userSpaceOnUse"><stop stop-color="#FF9419"></stop><stop offset="0.43" stop-color="#FF021D"></stop><stop offset="0.99" stop-color="#E600FF"></stop></linearGradient></defs><path fill="#fff" d="M86.484 40.586c0 .846-.179 1.593-.537 2.25a3.718 3.718 0 0 1-1.514 1.524c-.657.358-1.394.538-2.24.538H78v6.104h5.079c1.912 0 3.625-.428 5.148-1.285a9.36 9.36 0 0 0 3.585-3.545c.866-1.503 1.305-3.196 1.305-5.088V21.018h-6.633v19.568Zm17.856-1.823h13.891v-5.606H104.34v-6.363h15.355v-5.776H97.877v29.974h22.246v-5.776H104.34v-6.453Zm17.865-11.8h8.882v24.02h6.633v-24.02h8.842v-5.945h-24.367v5.955l.01-.01Zm47.022 9.002a7.85 7.85 0 0 0-1.673-.647 7.47 7.47 0 0 0 1.275-.488c1.096-.568 1.962-1.364 2.579-2.39.618-1.026.936-2.2.936-3.535 0-1.524-.418-2.888-1.244-4.093-.827-1.195-1.992-2.131-3.486-2.808-1.494-.667-3.206-1.006-5.118-1.006h-13.315v29.974h13.574c2.011 0 3.804-.348 5.387-1.055 1.573-.707 2.798-1.683 3.675-2.948.866-1.255 1.304-2.689 1.304-4.302 0-1.484-.338-2.808-1.026-3.983a7.05 7.05 0 0 0-2.858-2.729l-.01.01Zm-13.603-9.918h5.886c.816 0 1.533.15 2.161.438a3.353 3.353 0 0 1 1.464 1.255c.348.537.527 1.175.527 1.902 0 .727-.179 1.414-.527 1.981-.349.568-.837.996-1.464 1.305-.628.309-1.345.458-2.161.458h-5.886v-7.35.01Zm10.138 18.134c-.378.567-.916 1.006-1.603 1.314-.697.309-1.484.458-2.39.458h-6.145v-7.687h6.145c.886 0 1.673.169 2.37.497.687.329 1.235.787 1.613 1.385.378.597.578 1.274.578 2.041 0 .767-.19 1.424-.568 1.992Zm29.596-5.308c1.663-.797 2.947-1.922 3.864-3.366.916-1.444 1.374-3.117 1.374-5.029s-.448-3.525-1.344-4.959c-.897-1.434-2.171-2.54-3.814-3.326-1.644-.787-3.546-1.175-5.717-1.175h-13.124v29.974h6.642V40.078h4.322l6.084 10.914h7.578l-6.851-11.72c.339-.12.677-.25.996-.399h-.01Zm-2.151-6.124a3.599 3.599 0 0 1-1.583 1.444c-.688.338-1.494.507-2.42.507h-5.975v-8.295h5.975c.926 0 1.732.17 2.42.498a3.637 3.637 0 0 1 1.583 1.434c.368.618.558 1.355.558 2.19 0 .837-.19 1.574-.558 2.202v.02Zm20.594-11.731-10.706 29.974h6.742l2.121-6.612h11.114l2.27 6.612h6.612L220.99 21.018h-7.189Zm-.339 18.343 3.445-10.576.409-1.922.408 1.922 3.685 10.576h-7.947Zm20.693 11.631h6.851V21.018h-6.851v29.974Zm31.02-9.7-12.896-20.274h-6.463v29.974h6.055V30.717l12.826 20.275h6.533V21.018h-6.055v20.275Zm31.528-3.355c-.647-1.245-1.564-2.29-2.729-3.137-1.165-.846-2.509-1.404-4.023-1.693l-5.098-1.045c-.797-.19-1.434-.518-1.902-.996-.469-.478-.708-1.076-.708-1.783 0-.647.17-1.205.518-1.683.339-.478.827-.846 1.444-1.115.618-.269 1.335-.398 2.151-.398.817 0 1.554.139 2.181.418.627.279 1.115.667 1.464 1.175s.528 1.075.528 1.723h6.642c-.04-1.743-.528-3.287-1.444-4.621-.916-1.344-2.201-2.39-3.834-3.147-1.633-.757-3.505-1.135-5.597-1.135-2.091 0-3.943.388-5.566 1.175-1.623.787-2.898 1.872-3.804 3.266-.906 1.395-1.364 2.978-1.364 4.76 0 1.444.288 2.749.876 3.904a7.908 7.908 0 0 0 2.479 2.898c1.076.767 2.311 1.304 3.725 1.603l5.397 1.115c.886.21 1.584.598 2.101 1.156.518.557.767 1.244.767 2.08a3.03 3.03 0 0 1-.567 1.803c-.379.528-.907.936-1.584 1.225-.677.289-1.474.428-2.39.428-.916 0-1.782-.159-2.529-.478-.747-.318-1.325-.776-1.733-1.374-.418-.587-.617-1.275-.617-2.041h-6.642c.029 1.872.527 3.515 1.513 4.949.976 1.424 2.32 2.54 4.033 3.336 1.713.797 3.675 1.195 5.886 1.195 2.21 0 4.202-.408 5.915-1.225 1.723-.816 3.057-1.942 4.023-3.376.966-1.434 1.444-3.057 1.444-4.87 0-1.483-.329-2.847-.976-4.102l.02.01Z"></path><path fill="url(#__WEBTEAM_UI_SITE_HEADER_LOGO_ID__0)" d="M20.34 3.66 3.66 20.34A12.504 12.504 0 0 0 0 29.18V59c0 2.76 2.24 5 5 5h29.82c3.32 0 6.49-1.32 8.84-3.66l16.68-16.68c2.34-2.34 3.66-5.52 3.66-8.84V5c0-2.76-2.24-5-5-5H29.18c-3.32 0-6.49 1.32-8.84 3.66Z"></path><path fill="#000" d="M48 16H8v40h40V16Z"></path><path fill="#fff" d="M30 47H13v4h17v-4Z"></path></svg></a>
</div>

Special thanks to [JetBrains](https://www.jetbrains.com/) for their continuous sponsorship of this project over the last 3 years, and for their support to open-source software (OSS) initiatives.
