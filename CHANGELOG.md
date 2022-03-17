## unreleased

## [1.10.0] - 2022-03-17

- Bugfix for unwanted conversion of numbers in strings(#47)
- Filter - Handle components with period (.) in their name/key (#37)

## [1.9.2] - 2022-02-10

- Improved the matching of large numbers in YAML/JSON to prevent unwanted conversions

## [1.9.1] - 2022-02-09

- Bumped dependencies
- Handle large numbers more safely in YAML/JSON (#41 / #42)

## [1.9.0] - 2022-01-25

- Filter - Handle components with period (.) in their name/key (#37)
- Filter - Inverse operation IDs
- Updated CLI output
- Improved sort components logic
- Async/Await implementation
- Code formatting
- Extended CLI tests

## [1.8.1] - 2022-01-05

- Integrated "case-anything" package
- Enabled additional casing options (Ada_Case, Train-Case, ...)
- Set "@" and "$" as special characters during case formatting
- Migrated tests from Mocha to Jest

## [1.8.0] - 2021-12-27

- new feature - Formatting - Change casing of OpenAPI elements
  - Support common casing (camelCase, PascalCase, kebap-case, snake_case, ...)
  - Format the casing of fields & model names/keys for: properties, operationId, query params, path variables, headers, components

For more details on this new feature: https://github.com/thim81/openapi-format#openapi-formatting-configuration-options

## [1.7.2] - 2021-12-17

- Filtering - Fix handling of `inverseTags` for operations without tags (#25)

## [1.7.1] - 2021-12-03

- Reverted openapi-format success output because of minor offset

## [1.7.0] - 2021-12-03

- Filtering - Inverse filtering for operationIds via `inverseOperationIds`
- Filtering - Inverse filtering for tags via `inverseTags`
- Filtering - Inverse filtering for methods via `inverseMethods`
- Keep empty security object (#23)
- Improved openapi-format success output

## [1.6.3] - 2021-10-12

- Added the option to replace words/characters in description, summary, URL fields with new value

## [1.6.2] - 2021-10-08

- Fix for unsafe Object.keys variables

## [1.6.1] - 2021-10-08

- Fix for issue with the markdown comments strip filtering when non-strings descriptions

## [1.6.0] - 2021-10-08

- Added option to remove all "unused" component items through recursion
- Improved the openapi-format terminal log output and how verbose is handled
- Filtering will remove lines with markdown comments (syntax [comment]: <>) from the description fields.
- Fix/Hack to handle x-tagGroups filtering on flagValues

## [1.5.0] - 2021-10-05

- Added option to remove "unused" component items.

## [1.4.1] - 2021-10-05

- Implemented the missing functionality for removal of OpenApi.x-tagGroups matching flags

## [1.4.0] - 2021-10-02

- Added option to strip flags based on the value of the flags from OpenAPI
- Added NPM badges

## [1.3.0] - 2021-09-03

- Added option to strip flags from OpenAPI
- Handled the unwanted sorting of components > examples > value properties
- Bumped dependencies @stoplight/yaml, mocha

## [1.2.5] - 2021-07-22

- Enhancement that will remove also openapi.tags when filtering on tags

## [1.2.4] - 2021-06-14

Released on 14 June 2021

- Dependency bumped by dependabot for security reasons

## [1.2.3] - 2021-05-23

- Reduced package size by setting files in packages.json and excluding the tests

## [1.2.2] - 2021-05-19

- Bug fix for sort file error when a custom sort file was defined

## [1.2.1] - 2021-05-19

- Bug fix #4 for sort file error - no such file or directory "defaultSort.json"

## [1.2.0] - 2021-05-15

- Added Filter OpenAPI files based on an operation definition, with matching logic and wildcard support

## [1.1.0] - 2021-04-11

- Added the option to sort the items of the components (schemas, parameters, ...) by alphabet
- Aligned YAML parsing style with Stoplight Studio style
- Added a reference to the asyncapi-format package
- Minor text corrections Bumped the minor version to 1.1.0 because of the changes of the changes in the YAML output
  because of the switch the @stoplight/yaml package

## [1.0.5] - 2021-03-22

- Bug fix #3 - "properties" in the examples section gets incorrectly handled

## [1.0.4] - 2021-03-18

- Bug fix #2 - Handle fields named "properties" in the properties object properly

## [1.0.3] - 2021-03-17

- Updated the documentation & links to the specification

## [1.0.2] - 2021-03-16

### Added

- Filter - Added support to filter out OpenApi.tags matching the flags
- Filter - Added support for clean-up of path items without operations
- Bug fix - openapi-format not taken into account the customSort file

## [1.0.1] - 2021-03-16

- Improved handling of file references from within node_modules
- Handled an undefined exception

## [1.0.0] - 2021-03-15

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
