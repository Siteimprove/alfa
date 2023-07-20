# Package `@siteimprove/alfa-style`

## Description

This package implements support for CSS properties.

## Scaffolding

To avoid circular dependencies, the package is organised as follows (from bottom to top) (all paths are relative to `src/`) :

- `longhand.ts`: defines the basic class to model longhand properties;
- `property/*.ts` (part of): individual longhand properties, one per file;
- `longhands.ts`: wraps all longhand properties in a nice bundle and export convenient types;
- `shorthand.ts`: defines the basic class to model shorthand properties, depends on the names of longhands as defined in previous file;
- `property/*.ts` (part of): individual shorthand properties, one per file;
- `shorthands.ts`: wraps all shorthand properties in a nice bundle and export convenient types;
- `style.ts`: expose the actual API to manipulate the properties.

## Development

To add a new property, create a file in `src/property` to define the property, then import the file and add the property to the `const` in `longhands.ts` or `shorthands.ts`.
