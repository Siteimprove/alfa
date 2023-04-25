# Package `@siteimprove/alfa-style`

## Description

This package implement support for CSS properties.

## Scaffolding

To avoid circular dependencies, the package is organised as follow (from bottom to top) (all paths are relative to `src/`) :

- `foo-prop-class.ts`: defines the basic class to model longhand properties;
- `property2/*.ts` (part of): individual longhand properties, one per file;
- `foo-all-props.ts`: wraps all longhand properties in a nice bundle and export convenient types;
- `???`: defines the basic class to model shorthand properties, depends on the names of longhands as defined in previous file.
- `property2/*.ts` (part of): individual shorthand properties, one per file;
- `???`: wraps all shorthand properties in a nice bundle and export convenient types;
- `style.ts`: expose the actual API to manipulate the properties.

## Development

To add a new property, create a file in `src/property2` to define the property, then import the file and add the property to the `const` in `foo-all-props.ts` or `???`.
