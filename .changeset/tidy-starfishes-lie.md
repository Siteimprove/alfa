---
"@siteimprove/alfa-toolchain": minor
---

**Added:** Initial release of a package to handle the toolchain

This package currently handles changelog generation and several validations of the code structure:
- Checking that API extractor config is defined on each workspace.
- Checking that `package.json` match the expected structure.
- Checking that `package.json`'s dependencies match `tsconfig.json`'s references.

