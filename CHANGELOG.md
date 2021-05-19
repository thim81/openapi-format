## Version 1.2.1

Released on 19 May 2021

- Bugfix #4 for sort file error - no such file or directory "defaultSort.json"

## Version 1.2.0

Released on 15 May 2021

- Added Filter OpenAPI files based on an operation definition, with matching logic and wildcard support

## Version 1.1.0

Released on 11 Apr 2021

- Added the option to sort the items of the components (schemas, parameters, ...) by alphabet
- Aligned YAML parsing style with Stoplight Studio style
- Added a reference to the asyncapi-format package
- Minor text corrections Bumped the minor version to 1.1.0 because of the changes of the changes in the YAML output
  because of the switch the @stoplight/yaml package

## Version 1.0.5

Released on 22 Mar 2021

- Bug fix #3 - "properties" in the examples section gets incorrectly handled

## Version 1.0.4

Released on 18 Mar 2021

- Bug fix #2 - Handle fields named "properties" in the properties object properly

## Version 1.0.3

Released on 17 Mar 2021

- Updated the documentation & links to the specification

## Version 1.0.2

Released on 16 Mar 2021

Changelog

- Filter - Added support to filter out OpenApi.tags matching the flags
- Filter - Added support for clean-up of path items without operations
- Bug fix - openapi-format not taken into account the customSort file

## Version 1.0.1

Released on 16 Mar 2021

- Improved handling of file references from within node_modules
- Handled an undefined exception

## version 1.0.0

Released on 15 Mar 2021

Initial commit with features

- Order OpenAPI fields in a default order
- Order OpenAPI fields in a custom order
- Filter OpenAPI files based on methods
- Filter OpenAPI files based on flags
- Filter OpenAPI files based on tags
- Filter OpenAPI files based on operationID's
- Rename the OpenAPI title
- Support OpenAPI documents in JSON format
- Support OpenAPI documents in YAML format
- Format via CLI
- Format via config files
- Use via as Module
- Support for OpenAPI 3.0
